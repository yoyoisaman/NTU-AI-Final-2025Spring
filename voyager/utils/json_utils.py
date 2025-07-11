import json
import re
from typing import Any, Dict, Union
from .file_utils import f_join


def json_load(*file_path, **kwargs):
    file_path = f_join(file_path)
    with open(file_path, "r") as fp:
        return json.load(fp, **kwargs)


def json_loads(string, **kwargs):
    return json.loads(string, **kwargs)


def json_dump(data, *file_path, **kwargs):
    file_path = f_join(file_path)
    with open(file_path, "w") as fp:
        json.dump(data, fp, **kwargs)


def json_dumps(data, **kwargs):
    """
    Returns: string
    """
    return json.dumps(data, **kwargs)


# ---------------- Aliases -----------------
# add aliases where verb goes first, json_load -> load_json
load_json = json_load
loads_json = json_loads
dump_json = json_dump
dumps_json = json_dumps


def extract_char_position(error_message: str) -> int:
    """Extract the character position from the JSONDecodeError message.
    Args:
        error_message (str): The error message from the JSONDecodeError
          exception.
    Returns:
        int: The character position.
    """
    import re

    char_pattern = re.compile(r"\(char (\d+)\)")
    if match := char_pattern.search(error_message):
        return int(match[1])
    else:
        raise ValueError("Character position not found in the error message.")


def add_quotes_to_property_names(json_string: str) -> str:
    """
    Add quotes to property names in a JSON string.
    Args:
        json_string (str): The JSON string.
    Returns:
        str: The JSON string with quotes added to property names.
    """

    def replace_func(match):
        return f'"{match.group(1)}":'

    property_name_pattern = re.compile(r"(\w+):")
    corrected_json_string = property_name_pattern.sub(replace_func, json_string)

    try:
        json.loads(corrected_json_string)
        return corrected_json_string
    except json.JSONDecodeError as e:
        raise e


def balance_braces(json_string: str) -> str:
    """
    Balance the braces in a JSON string.
    Args:
        json_string (str): The JSON string.
    Returns:
        str: The JSON string with braces balanced.
    """

    open_braces_count = json_string.count("{")
    close_braces_count = json_string.count("}")

    while open_braces_count > close_braces_count:
        json_string += "}"
        close_braces_count += 1

    while close_braces_count > open_braces_count:
        json_string = json_string.rstrip("}")
        close_braces_count -= 1

    try:
        json.loads(json_string)
        return json_string
    except json.JSONDecodeError as e:
        raise e


def fix_invalid_escape(json_str: str, error_message: str) -> str:
    while error_message.startswith("Invalid \\escape"):
        bad_escape_location = extract_char_position(error_message)
        json_str = json_str[:bad_escape_location] + json_str[bad_escape_location + 1 :]
        try:
            json.loads(json_str)
            return json_str
        except json.JSONDecodeError as e:
            error_message = str(e)
    return json_str


def correct_json(json_str: str) -> str:
    """
    Correct common JSON errors.
    Args:
        json_str (str): The JSON string.
    """

    try:
        json.loads(json_str)
        return json_str
    except json.JSONDecodeError as e:
        error_message = str(e)
        if error_message.startswith("Invalid \\escape"):
            json_str = fix_invalid_escape(json_str, error_message)
        if error_message.startswith(
            "Expecting property name enclosed in double quotes"
        ):
            json_str = add_quotes_to_property_names(json_str)
            try:
                json.loads(json_str)
                return json_str
            except json.JSONDecodeError as e:
                error_message = str(e)
        if balanced_str := balance_braces(json_str):
            return balanced_str
    return json_str

def fix_and_parse_json(json_str):
    """處理可能被包在 markdown code block 中的不規範 JSON 字串"""
    if not json_str or json_str.isspace():
        return {
            "reasoning": "Empty response", 
            "success": False, 
            "critique": "Empty response received"
        }

    # 去除 Markdown 的 ```json 或 ``` 標記
    json_str = re.sub(r'^```(?:json)?\s*', '', json_str.strip(), flags=re.IGNORECASE)
    json_str = re.sub(r'\s*```$', '', json_str.strip())

    # 嘗試直接解析
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    # 嘗試修復單引號為雙引號
    try:
        fixed = json_str.replace("'", '"')
        fixed = re.sub(r'([{,])\s*(\w+):', r'\1"\2":', fixed)
        return json.loads(fixed)
    except Exception:
        return {
            "reasoning": "Failed to parse response", 
            "success": False, 
            "critique": "Please provide output in valid JSON format"
        }

# def fix_json(json_str: str, schema: str) -> str:
#     """Fix the given JSON string to make it parseable and fully complient with the provided schema."""
#
#     # Try to fix the JSON using gpt:
#     function_string = "def fix_json(json_str: str, schema:str=None) -> str:"
#     args = [f"'''{json_str}'''", f"'''{schema}'''"]
#     description_string = (
#         "Fixes the provided JSON string to make it parseable"
#         " and fully complient with the provided schema.\n If an object or"
#         " field specified in the schema isn't contained within the correct"
#         " JSON, it is ommited.\n This function is brilliant at guessing"
#         " when the format is incorrect."
#     )
#
#     # If it doesn't already start with a "`", add one:
#     if not json_str.startswith("`"):
#         json_str = "```json\n" + json_str + "\n```"
#     result_string = call_ai_function(
#         function_string, args, description_string, model=cfg.fast_llm_model
#     )
#     if cfg.debug:
#         print("------------ JSON FIX ATTEMPT ---------------")
#         print(f"Original JSON: {json_str}")
#         print("-----------")
#         print(f"Fixed JSON: {result_string}")
#         print("----------- END OF FIX ATTEMPT ----------------")
#
#     try:
#         json.loads(result_string)  # just check the validity
#         return result_string
#     except:  # noqa: E722
#         # Get the call stack:
#         # import traceback
#         # call_stack = traceback.format_exc()
#         # print(f"Failed to fix JSON: '{json_str}' "+call_stack)
#         return "failed"
