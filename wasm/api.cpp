#include <cstdio>
#include <string>
#include <boost/json/src.hpp>
#include <rime_api.h>

enum {
    COMMITTED, ACCEPTED, REJECTED
};

RimeSessionId session_id;
RimeCommit commit;
RimeContext context;
std::string json_string;

inline const char *to_json(boost::json::object &obj) {
    json_string = boost::json::serialize(obj);
    return json_string.c_str();
}

extern "C" {
    void set_option(const char *option, int value) {
        RimeSetOption(session_id, option, value);
    }

    void init() {
        RimeSetup(NULL);
        RimeInitialize(NULL);
        session_id = RimeCreateSession();
        RIME_STRUCT_INIT(RimeCommit, commit);
        RIME_STRUCT_INIT(RimeContext, context);
    }

    const char *process(const char *input) {
        boost::json::object obj;
        RimeSimulateKeySequence(session_id, input);
        RimeFreeCommit(&commit);
        Bool hasCommitted = RimeGetCommit(session_id, &commit);
        if (hasCommitted) {
            obj["committed"] = commit.text;
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
                boost::json::object candidate;
                candidate["text"] = menu.candidates[i].text;
                candidate["comment"] = menu.candidates[i].comment;
                candidates.push_back(candidate);
            }
            obj["candidates"] = candidates;
        } else if (hasCommitted) {
            obj["state"] = COMMITTED;
        } else {
            obj["state"] = REJECTED;
        }
        return to_json(obj);
    }

    void set_ime(const char *ime) {
        RimeSelectSchema(session_id, ime);
    }
}
