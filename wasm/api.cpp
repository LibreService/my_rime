#include <cstdio>
#include <string>
#include <boost/json/src.hpp>
#include <rime_api.h>
#include <bzlib.h>

#define OBUF_LEN 5000

void uncompress(const char *input_path, const char *output_path) {
    FILE *output = fopen(output_path, "wb");
    FILE *input = fopen(input_path, "rb");
    int bzerr;
    BZFILE* bzf = BZ2_bzReadOpen(NULL, input, 0, 0, NULL, 0);

    do {
        char obuf[OBUF_LEN];
        int nread = BZ2_bzRead(&bzerr, bzf, obuf, OBUF_LEN);
        if (nread > 0) {
            fwrite(obuf, 1, nread, output);
        }
    } while(bzerr == BZ_OK);

    BZ2_bzReadClose(NULL, bzf);
    fclose(input);
    fclose(output);
}

enum {
    COMMITTED, ACCEPTED, REJECTED
};

RimeSessionId session_id;
RimeCommit commit;
RimeContext context;
std::string json_string;

const char *to_json(boost::json::object &obj) {
    json_string = boost::json::serialize(obj);
    return json_string.c_str();
}

extern "C" {
    void set_option(const char *option, int value) {
        RimeSetOption(session_id, option, value);
    }

    void init() {
        uncompress("build/luna_pinyin.table.bin.bz2", "build/luna_pinyin.table.bin");
        RimeSetup(NULL);
        RimeInitialize(NULL);
        session_id = RimeCreateSession();
        set_option("zh_simp", 1);
        RIME_STRUCT_INIT(RimeCommit, commit);
        RIME_STRUCT_INIT(RimeContext, context);
    }

    const char *process(const char *input) {
        boost::json::object obj;
        RimeSimulateKeySequence(session_id, input);
        RimeFreeCommit(&commit);
        if (RimeGetCommit(session_id, &commit)) {
            obj["state"] = COMMITTED;
            obj["committed"] = commit.text;
            return to_json(obj);
        }
        RimeFreeContext(&context);
        RimeGetContext(session_id, &context);
        if (context.composition.length > 0) {
            auto &composition = context.composition;
            std::string pre_edit = composition.preedit;
            obj["head"] = pre_edit.substr(0, composition.sel_start);
            obj["body"] = pre_edit.substr(composition.sel_start, composition.sel_end - composition.sel_start);
            obj["tail"] = pre_edit.substr(composition.sel_end);
            auto &menu = context.menu;
            obj["state"] = ACCEPTED;
            obj["page"] = menu.page_no;
            obj["isLastPage"] = bool(menu.is_last_page);
            obj["highlighted"] = menu.highlighted_candidate_index;
            boost::json::array candidates;
            for (int i = 0; i < menu.num_candidates; ++i) {
                candidates.push_back(menu.candidates[i].text);
            }
            obj["candidates"] = candidates;
            return to_json(obj);
        }
        obj["state"] = REJECTED;
        return to_json(obj);
    }
}
