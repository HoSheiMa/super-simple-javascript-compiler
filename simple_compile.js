// syntax
// x = 1
// add(x, 2)
// z = minus(x, 1)
// terminal('x:', x, 'y:', y)

const fs = require("fs");

class Simple_compiler {
  file = null;

  bind_structure = [];
  constructor(file_path) {
    try {
      const file = fs.readFileSync(file_path, "utf8");
      this.file = file;
    } catch (err) {
      console.error(err);
    }
  }
  pull_structure(file) {
    let structure = [];
    let focus_word = "";
    let ignore_space_mode = false;
    let open_bracket_length = 0;
    for (let step of file) {
      if (step.includes("'")) {
        ignore_space_mode = !ignore_space_mode;
      }
      if (step.includes(")") && open_bracket_length > 0) {
        ignore_space_mode = false;
        open_bracket_length--;
      }
      if (step.includes("(")) {
        ignore_space_mode = true;
        open_bracket_length++;
      }
      if (step == "," && !ignore_space_mode) {
        continue;
      }

      if (
        (step != " " || ignore_space_mode || open_bracket_length > 0) &&
        step != "\n"
      ) {
        focus_word += step;
      } else if (focus_word !== "") {
        structure.push(focus_word);
        focus_word = "";
      }
    }
    if (focus_word !== "") {
      structure.push(focus_word);
      focus_word = "";
    }
    return structure;
  }

  build_bind_structure(structure) {
    let check_prev = false;
    let bind_structure = [];

    for (let step = 0; step < structure.length; step++) {
      let _step = structure[step];
      let type = "string"; // default string
      let caller = null;
      let open_bracket_length = false;
      let ignore_space_mode = false;
      let params_mode = false;
      let text = "";
      let params = [];
      for (let letter of _step) {
        if (letter === "(") {
          type = "caller_function";
          params_mode = true;
          caller = text;
          text = "";
          continue;
        } else if (letter === ")") {
          bind_structure.push({
            type: type,
            name: caller,
            params: this.pull_structure(text),
          });
          break;
        } else if (letter === "'") {
          ignore_space_mode = !ignore_space_mode;
        } else if (letter === "=") {
          check_prev = true;
          continue;
        }

        if (check_prev) {
          let prev_letter = structure[step - 1];
          let variable_name = structure[step - 2];

          if (prev_letter == "=") {
            type = "store_variable";
          }
          check_prev = false;
          bind_structure.push({
            type: type,
            name: variable_name,
            value: _step,
          });
        }

        if (params_mode) {
          text += letter;
        } else {
          text += letter;
        }
      }
    }
    return bind_structure;
  }

  run() {
    let structure = this.pull_structure(this.file);
    let bind_structure = this.build_bind_structure(structure);
    console.log(structure);
    console.log(bind_structure);
  }
}

new Simple_compiler("/Users/qandilafa/Desktop/compile/simple.sci").run();
