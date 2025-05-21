import openai
import json
import os
from typing import List
from googlesearch import search as _search
from bs4 import BeautifulSoup
from charset_normalizer import detect
import asyncio
from requests_html import AsyncHTMLSession
import urllib3
urllib3.disable_warnings()

openai.api_key = os.getenv("OPENAI_API_KEY") 
MAX_SINGLE_SEARCH_RESULT_CHARS = 3000
MIN_SINGLE_SEARCH_RESULT_CHARS = 1000
async def worker(s:AsyncHTMLSession, url:str):
    try:
        header_response = await asyncio.wait_for(s.head(url, verify=False), timeout=10)
        if 'text/html' not in header_response.headers.get('Content-Type', ''):
            return None
        r = await asyncio.wait_for(s.get(url, verify=False), timeout=10)
        return r.text
    except:
        return None
def extract_main_content(html_text, keyword):
    if not html_text:
        return ''
    soup = BeautifulSoup(html_text, 'html.parser')
    for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
        tag.decompose()
    main_content = soup.find('article') or soup.find('div', class_='content') or soup.find('body')
    if main_content:
        text = main_content.get_text(separator=' ', strip=True)
        if len(text) > MAX_SINGLE_SEARCH_RESULT_CHARS:
            return text[MIN_SINGLE_SEARCH_RESULT_CHARS:MAX_SINGLE_SEARCH_RESULT_CHARS]
        return ' '.join(text.split())
    return ''

async def get_htmls(urls):
    session = AsyncHTMLSession()
    tasks = (worker(session, url) for url in urls)
    return await asyncio.gather(*tasks)

async def search(keyword: str, n_results: int=3) -> List[str]:
    '''
    This function will search the keyword and return the text content in the first n_results web pages.
    Warning: You may suffer from HTTP 429 errors if you search too many times in a period of time. This is unavoidable and you should take your own risk if you want to try search more results at once.
    The rate limit is not explicitly announced by Google, hence there's not much we can do except for changing the IP or wait until Google unban you (we don't know how long the penalty will last either).
    '''
    keyword = keyword[:100]
    # First, search the keyword and get the results. Also, get 2 times more results in case some of them are invalid.
    results = list(_search(keyword, n_results * 4, lang="en", region="tw", unique=True))
    # Then, get the HTML from the results. Also, the helper function will filter out the non-HTML urls.
    results = await get_htmls(results)
    # Filter out the None values and extract main content.
    results = [extract_main_content(html, keyword) for html in results if html is not None]
    # Filter out non-utf-8 encoding results (no need for .get_text() since results are already strings).
    results = [x for x in results if detect(x.encode()).get('encoding') == 'utf-8']
    # Return the first n results.
    return results[:n_results]

# --- RAG函數 ---
async def rag_enhanced_guide(task_string, search_results):
    """
    將搜尋結果作為 RAG 參考，再次送入 LLM 生成更詳細的指南。
    """
    search_snippets = "\n\n".join(search_results)
    prompt = f"""
    You are an expert Minecraft player and guide. Your goal is to break down a given Minecraft task into actionable steps, list all necessary materials, and provide important considerations or tips.

    The task is: "{task_string}"
    And here are some relevant information snippets from web searches. Please use this information to enrich and refine your guide, especially focusing on details, exact quantities, crafting recipes, and potential pitfalls.

    --- Web Search Results ---
    {search_snippets}
    --- End of Web Search Results ---

    You should assume player have nothing in inventory at the start, and all resources must be acquired from scratch.
    Please give the "Required Materials", "Step-by-Step Guide", and "Important Considerations/Tips" sections based on the provided web search results. Ensure the guide is extremely detailed and helpful for a beginner, covering everything from obtaining raw resources to completing the final task.
    Please note the topological relationship between items, for example, there is only a 2x2 crafting space before the crafting table is made, not 3x3.
    
    Your response should still follow the structured format:

    ## Task: {task_string}

    ### Overview:
    [Brief overview of the task]

    ### Required Materials:
    - [Material 1]: [Quantity/Notes, including how to obtain/craft, if crafting required, use 3x3 grid format]
    - [Material 2]: [Quantity/Notes, including how to obtain/craft, if crafting required, use 3x3 grid format]
    ...

    ### Step-by-Step Guide:
    1. [Step 1: Action to perform, with more details from RAG and precise placement/crafting instructions]
    2. [Step 2: Action to perform, with more details from RAG and precise placement/crafting instructions]
    ...

    ### Important Considerations/Tips:
    - [Tip 1, potentially enhanced by RAG]
    - [Tip 2, potentially enhanced by RAG]
    ...
    """
    print("\n呼叫 GPT 進行 RAG 增強...")
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful Minecraft assistant, enhancing guides with web search information."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000 # 增加 token 限制以容納更多細節
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"呼叫 OpenAI API 錯誤: {e}")
        return None

async def main():
    # task = input("請輸入您的 Minecraft 任務: ")
    task = "Craft 1 diamond pickaxe"
    search_results = await search(f"Minecraft {task}")
    for r in search_results:
        print(r)
        print()
    final_guide = await rag_enhanced_guide(task, search_results[0])
    if final_guide:
        print("\n--- 最終任務指南 (RAG 增強) ---")
        print(final_guide)
    else:
        print("\n無法生成 RAG 增強的指南。")

    if final_guide:
        output_data = {
            "task": task,
            "guide": final_guide
        }
        try:
            with open("TaskPrepare.json", "w", encoding="utf-8") as f:
                json.dump(output_data, f, ensure_ascii=False, indent=4)
            print("\n任務指南已成功儲存到 TaskPrepare.json")
        except Exception as e:
            print(f"儲存 JSON 檔案時發生錯誤: {e}")

if __name__ == "__main__":
    asyncio.run(main())