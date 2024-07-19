#include <boost/json/src.hpp>
#include <emscripten.h>
#include <rime_api.h>
#include <string>
#include <unordered_map>
#include <vector>

namespace my_rime {

enum { COMMITTED, ACCEPTED, REJECTED, UNHANDLED };

auto api = rime_get_api();

RimeTraits traits = {0};
RimeSessionId session_id;
RimeCommit commit;
RimeContext context;
std::string json_string;
std::vector<std::string> updated_options;
std::string updated_schema;
std::unordered_map<std::string, std::string> schema_name;
bool has_pre_edit;
bool processing;
bool rime_started = false;
// Before a successful deployment, use schema name in schemas.json instead of
// .schema.yaml.
bool deployed = false;
int page_size = 0;

template <typename T> inline const char *to_json(T &obj) {
  json_string = boost::json::serialize(obj);
  return json_string.c_str();
}

void handler(void *context_object, RimeSessionId session_id,
             const char *message_type, const char *message_value) {
  std::string msg_type = message_type;
  if (processing && msg_type == "option") {
    updated_options.push_back(message_value);
  } else if (processing && msg_type == "schema") {
    updated_schema = message_value;
  } else if (msg_type == "deploy") {
    boost::json::array schema_array;
    if (std::string(message_value) == "success") {
      deployed = true;
      RimeSchemaList schemas;
      api->get_schema_list(&schemas);
      for (size_t i = 0; i < schemas.size; ++i) {
        boost::json::object obj;
        obj["id"] = schemas.list[i].schema_id;
        obj["name"] = schemas.list[i].name;
        schema_array.push_back(obj);
      }
      api->free_schema_list(&schemas);
    }
    EM_ASM(_deployStatus(UTF8ToString($0), UTF8ToString($1)), message_value,
           to_json(schema_array));
  }
}

std::string get_schema_name(std::string schema) { return schema_name[schema]; }

void start_rime() {
  api->initialize(&traits);
  api->set_notification_handler(handler, NULL);
  rime_started = true;
}

void stop_rime() {
  api->destroy_session(session_id);
  api->finalize();
  rime_started = false;
}

void pre_process() {
  updated_options.clear();
  updated_schema = "";
  processing = true;
}

const char *post_process() {
  processing = false;
  boost::json::object obj;
  if (updated_options.size()) {
    boost::json::array options;
    for (const std::string &s : updated_options) {
      options.push_back(s.c_str());
    }
    obj["updatedOptions"] = options;
  }
  if (updated_schema.size()) {
    obj["updatedSchema"] = updated_schema;
  }
  api->free_commit(&commit);
  Bool has_committed = api->get_commit(session_id, &commit);
  if (has_committed) {
    obj["committed"] = commit.text;
  }
  api->free_context(&context);
  api->get_context(session_id, &context);
  if (context.composition.length > 0) {
    auto &composition = context.composition;
    std::string pre_edit = composition.preedit;
    obj["head"] = pre_edit.substr(0, composition.sel_start);
    obj["body"] = pre_edit.substr(composition.sel_start,
                                  composition.sel_end - composition.sel_start);
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
      if (menu.candidates[i].comment) {
        candidate["comment"] = menu.candidates[i].comment;
      }
      candidates.push_back(candidate);
    }
    obj["candidates"] = candidates;
    if (context.select_labels != NULL) {
      boost::json::array select_labels;
      for (int i = 0; i < menu.num_candidates; ++i) {
        select_labels.push_back(context.select_labels[i]);
      }
      obj["selectLabels"] = select_labels;
    }
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

extern "C" {
void set_option(const char *option, int value) {
  api->set_option(session_id, option, value);
}

void init() {
  RIME_STRUCT_INIT(RimeTraits, traits);
  traits.shared_data_dir = "/usr/share/rime-data";
  traits.user_data_dir = "/rime";
  traits.app_name = "My RIME";
  api->setup(&traits);
  RIME_STRUCT_INIT(RimeCommit, commit);
  RIME_STRUCT_INIT(RimeContext, context);
}

void set_schema_name(const char *schema, const char *name) {
  schema_name[schema] = name;
}

void set_page_size(int size) { page_size = size; }

const char *process(const char *input) {
  pre_process();
  api->simulate_key_sequence(session_id, input);
  return post_process();
}

const char *select_candidate_on_current_page(int index) {
  pre_process();
  api->select_candidate_on_current_page(session_id, index);
  return post_process();
}

const char *change_page(bool backward) {
  pre_process();
  api->change_page(session_id, backward);
  return post_process();
}

void set_ime(const char *ime) {
  if (rime_started) {
    // Need to reset session when using F4 to select a schema
    // not available yet.
    api->destroy_session(session_id);
  } else {
    start_rime();
  }
  session_id = api->create_session();
  api->select_schema(session_id, ime);
}

void deploy() {
  stop_rime();
  start_rime();
  api->start_maintenance(true);
  session_id = api->create_session();
}

void reset() {
  deployed = false;
  stop_rime();
}
}

} // namespace my_rime
