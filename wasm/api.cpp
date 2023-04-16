#include <string>
#include <vector>
#include <boost/json/src.hpp>
#include <emscripten.h>
#include <rime_api.h>

enum {
    COMMITTED, ACCEPTED, REJECTED, UNHANDLED
};

RimeSessionId session_id;
RimeCommit commit;
RimeContext context;
std::string json_string;
bool has_pre_edit;
bool processing;
std::vector<std::string> updated_options;

inline const char *to_json(boost::json::object &obj) {
    json_string = boost::json::serialize(obj);
    return json_string.c_str();
}

void handler(void* context_object, RimeSessionId session_id, const char* message_type, const char* message_value) {
    std::string msg_type = message_type;
    if (processing && msg_type == "option") {
        updated_options.push_back(message_value);
    } else if (msg_type == "deploy") {
        EM_ASM(_deployStatus(UTF8ToString($0)), message_value);
    }
}

extern "C" {
    void set_option(const char *option, int value) {
        RimeSetOption(session_id, option, value);
    }

    void init() {
        RimeSetup(NULL);
        RimeInitialize(NULL);
        RimeSetNotificationHandler(handler, NULL);
        session_id = RimeCreateSession();
        RIME_STRUCT_INIT(RimeCommit, commit);
        RIME_STRUCT_INIT(RimeContext, context);
    }

    const char *process(const char *input) {
        boost::json::object obj;
        updated_options.clear();
        processing = true;
        RimeSimulateKeySequence(session_id, input);
        processing = false;
        if (updated_options.size()) {
            boost::json::array options;
            for (const std::string &s : updated_options) {
                options.push_back(s.c_str());
            }
            obj["updatedOptions"] = options;
        }
        RimeFreeCommit(&commit);
        Bool has_committed = RimeGetCommit(session_id, &commit);
        if (has_committed) {
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
            has_pre_edit = true;
        } else {
            if (has_committed) {
                obj["state"] = COMMITTED;
            } else if (has_pre_edit) {
                obj["state"] = REJECTED;
            } else {
                obj["state"] = UNHANDLED;
            }
            has_pre_edit = false;
        }
        return to_json(obj);
    }

    void set_ime(const char *ime) {
        RimeSelectSchema(session_id, ime);
    }

    void deploy () {
        RimeDestroySession(session_id);
        RimeStartMaintenance(true);
        session_id = RimeCreateSession();
    }
}
