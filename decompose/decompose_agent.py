import os
import json
import asyncio
from typing import List, Dict, Any, Optional
import openai
from googlesearch import search as _search
from bs4 import BeautifulSoup
from charset_normalizer import detect
from requests_html import AsyncHTMLSession
import urllib3
urllib3.disable_warnings()
import re
import aiohttp

class DecomposeAgent:
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("環境變數中找不到OpenAI API KEY")
        
        openai.api_key = self.openai_api_key
        self.MAX_SINGLE_SEARCH_RESULT_CHARS = 3000
        self.MIN_SINGLE_SEARCH_RESULT_CHARS = 1000
    
    def decompose(self, task: str) -> List[str]:
        return asyncio.run(self._decompose_async(task))
    
    async def _decompose_async(self, task: str) -> List[str]:
        print(f"Task: '{task}'")
        
        search_results = await self._search(f"Minecraft {task}")
        detailed_guide = await self._rag_enhanced_guide(task, search_results)
        if not detailed_guide:
            print("生成guideline出錯")
            return []
        
        initial_subgoals = self._decompose_task_into_subgoals(task, detailed_guide)
        if not initial_subgoals:
            print("生成初始subgoal出錯")
            return []
        
        refined_subgoals = await self._refine_subgoals(task, detailed_guide, initial_subgoals)
        if not refined_subgoals:
            print("優化subgoal出錯")
            return initial_subgoals
        
        print(f"\ntask decompose完成，共生成 {len(refined_subgoals)} 个subgoal")
        return refined_subgoals
    
    
    async def _worker(self, session: aiohttp.ClientSession, url: str):
        try:
            async with session.get(url, timeout=10, ssl=False) as response:
                html = await response.text()
                return (url, html)
        except Exception as e:
            print(f"抓取 {url} err: {e}")
            return (url, None)

    def _extract_main_content(self, html_text, keyword):
        soup = BeautifulSoup(html_text, 'html.parser')

        # 移除不必要的元素
        for tag in soup(['script', 'style', 'header', 'footer', 'nav']):
            tag.decompose()

        relevant_paragraphs = []
        for p in soup.find_all(['p', 'li', 'h1', 'h2', 'h3', 'div']):
            text = p.get_text().strip()
            if len(text) > 20 and keyword.lower() in text.lower():
                relevant_paragraphs.append(text)

        return '\n'.join(relevant_paragraphs)

    async def _get_htmls(self, urls):
        async with aiohttp.ClientSession() as session:
            tasks = [self._worker(session, url) for url in urls]
            return await asyncio.gather(*tasks)
    
    async def _search(self, keyword: str, n_results: int=3) -> List[str]:
        urls = list(_search(keyword, n_results * 4, lang="en", region="tw", unique=True))[:n_results]
        results = await self._get_htmls(urls)
        
        processed_results = []
        for url, html in results:
            if html:
                extracted = self._extract_main_content(html, keyword.split()[-1])
                
                if len(extracted) > self.MIN_SINGLE_SEARCH_RESULT_CHARS:
                    if len(extracted) > self.MAX_SINGLE_SEARCH_RESULT_CHARS:
                        extracted = extracted[:self.MAX_SINGLE_SEARCH_RESULT_CHARS] + "..."
                    processed_results.append(extracted)
        
        return processed_results
    
    async def _rag_enhanced_guide(self, task_string, search_results):
        search_snippets = "\n\n".join(search_results) if isinstance(search_results, list) else search_results
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
        print("\nRAG增強")
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful Minecraft assistant, enhancing guides with web search information."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            print(response.choices[0].message.content)
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return None
    
    
    def _decompose_task_into_subgoals(self, main_task: str, detailed_guide: str) -> List[str]:
        prompt = f"""
        You are an expert Minecraft task decomposition agent. Your goal is to break down a main Minecraft task into a strictly ordered list of atomic subgoals. Each subgoal should be the smallest possible actionable step.

        You should assume the player starts with absolutely nothing in their inventory and all resources must be acquired from scratch. 
        For example start from :mine 20 wood, create 1 create table, place 1 create table

        Consider the following main task: "{main_task}"

        Here is a detailed guide for completing this task, which you should use as reference for materials, steps, and considerations:
        --- Detailed Guide ---
        {detailed_guide}
        --- End of Detailed Guide ---

        When decomposing, adhere to these strict rules:
        0. Each subgoal should follow a concise format, such as "Mine [quantity] [block]", "Craft [quantity] [item]", "Smelt [quantity] [item]", "Place [quantity] [item]".
        1.  **Atomic Subgoals**: Each subgoal must be the smallest possible actionable step. For example, instead of "Craft an Iron Pickaxe", break it down into:
            - "Mine 10 Iron Ore"
            - "Craft 1 Furnace"
            - "Smelt 10 Iron Ore"
            - "Craft 1 Iron Pickaxe"
        2.  **Strict Ordering**: Subgoals must be in the exact chronological order they need to be completed. For example, "Craft 1 Wooden Pickaxe" must come after "Mine 5 Wood" and "Craft 1 Crafting Table".
        3.  **Clarity and Actionability**: Each subgoal should be a clear, concise instruction.
        
        Provide your response ONLY as a JSON array of strings, where each string is a subgoal.
        Example:
        ["Mine 3 wood logs", "Craft 1 crafting table", "Place 1 crafting table", ...]
        """

        print("\nGPT decompse...")
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",  
                response_format={"type": "json_object"}, 
                messages=[
                    {"role": "system", "content": "You are a Minecraft task decomposition agent. You output only a JSON array of ordered, atomic subgoals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1000 
            )
            
            json_response = response.choices[0].message.content
            print("GPT 返回初始subgoal")
            print(json_response)
            return json.loads(json_response)
        except json.JSONDecodeError as e:
            print(f"解析 GPT 輸出 JSON 錯誤: {e}")
            print(f"原始 GPT 輸出: {response.choices[0].message.content}")
            return []
        except Exception as e:
            print(f"調用 OpenAI API 錯誤: {e}")
            return []
    
    
    async def _refine_subgoals(self, main_task: str, detailed_guide: str, subgoals_list: List[str]) -> List[str]:
        subgoals_to_refine_str = "\n".join([f"- {subgoal}" for subgoal in subgoals_list])

        prompt = f"""
        You are an expert Minecraft task refinement agent. Your goal is to review, correct, and optimize a given ordered list of atomic Minecraft subgoals based on specific rules and the provided detailed guide.

        Main Task: "{main_task}"

        Detailed Guide for reference (materials, steps, and considerations):
        {detailed_guide}

        Subgoals to be refined:
        --- Original Subgoals ---
        {subgoals_to_refine_str}
        --- End of Original Subgoals ---

        Apply the following strict refinement rules:
        0. Each subgoal should follow a concise format, such as "Mine [quantity] [block]", "Craft [quantity] [item]", "Smelt [quantity] [item]", "Place [quantity] [item]".
        1. **Correct Task Order & Tool Dependencies**:
            - Review the entire sequence for correct chronological order and essential tool dependencies.
            - **Rule**: A tool MUST be acquired (mined/crafted) *before* it is used to mine or break a required resource.
            - **Tool Progression**: Wooden tools → Stone tools → Iron tools → Diamond tools

        2. **Resource Calculation & Efficiency**:
            - Ensure all resource quantities are sufficient for all later crafting and building.
            - **Rule**: Gather resources in bulk at the appropriate time. Don't make the player return to the same area multiple times.
            - For example, if later subgoals require 12 wooden planks and 4 sticks (which equals 4 logs), then "Mine X Wood Logs" must cover this full requirement at the beginning.
            - Do **not under-collect**. Err on the side of overestimating slightly if necessary.

        3. **Atomic Subgoals**: 
            Each subgoal must be the smallest possible actionable step. For example, instead of "Craft an Iron Pickaxe", break it down into:
            - "Mine 10 Iron Ore"
            - "Craft 1 Furnace"
            - "Smelt 10 Iron Ore"
            - "Craft 1 Iron Pickaxe"

        Think step-by-step through the original subgoals, applying each rule carefully. Do not add explanations or reasoning to your final output.

        Provide your refined list of subgoals ONLY as a JSON array of strings, where each string is a subgoal. Wrap your entire JSON output in a Markdown code block with 'json' highlighting (e.g., ```json\n[\n  "subgoal1",\n  "subgoal2"\n]\n```).
        Example:
        ["Mine 3 wood logs", "Craft 1 crafting table", "Place 1 crafting table", ...]
        """

        print("\nGPT subgoal refine")
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a Minecraft task refinement agent. You output only a JSON array of refined subgoals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3, 
                max_tokens=1000 
            )
            json_response = response.choices[0].message.content
            print("GPT 返回優化後的Subgoal")
            print(json_response)
            json_match = re.search(r"```json\s*(\[.*?\])\s*```", json_response, re.DOTALL)
            if json_match:
                json_string = json_match.group(1) 
                return json.loads(json_string) 
            else:
                print("警告: 沒有找到json格式，嘗試直接解析")
                try:
                    return json.loads(json_response)
                except json.JSONDecodeError as e:
                    print(f"直接解析失敗 {e}")
                    print(f"返回原始Subgoal")
                    return subgoals_list
        except json.JSONDecodeError as e:
            print(f"解析GPT輸出JSON錯誤 {e}")
            print(f"原始 GPT 输出: {response.choices[0].message.content}")
            print(f"返回原始Subgoal")
            return subgoals_list
        except Exception as e:
            print(f"調用Open API 錯誤: {e}")
            return subgoals_list