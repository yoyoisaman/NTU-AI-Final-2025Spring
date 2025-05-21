import requests
import json
from bs4 import BeautifulSoup

def scrape_header_paragraph_to_json(url, output_filename="header_paragraph_data.json"):
    """
    爬取指定 URL 的內容，提取 <h1> 作為 header，其後續的 <p> 標籤內容作為 paragraph，
    並將這些配對儲存到 JSON 檔案中。
    每個 "paragraph" 字串是該 header 下所有 <p> 標籤文字的合併。

    Args:
        url (str): 要爬取的網站 URL。
        output_filename (str, optional): 輸出的 JSON 檔案名稱。
                                        預設為 "header_paragraph_data.json"。

    Returns:
        bool: 如果成功爬取並儲存則返回 True，否則返回 False。
    """
    try:
        # 設定 User-Agent，模擬瀏覽器請求
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # 發送 GET 請求，設定超時
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status() # 若請求失敗則拋出例外
        # 嘗試自動偵測並設定正確的編碼
        response.encoding = response.apparent_encoding
        html_content = response.text

        # 使用 BeautifulSoup 解析 HTML
        soup = BeautifulSoup(html_content, 'html.parser')

        extracted_items = []
        current_header_text = None
        current_paragraphs_texts = []

        # 查找頁面中所有的 <h1> 和 <p> 標籤，並按它們在文件中的出現順序處理
        # 這樣可以確保 <p> 標籤能被正確地關聯到它們前面的 <h1>
        tags = soup.find_all(['h1', 'p'])

        for tag in tags:
            if tag.name == 'h1':
                # 如果之前有正在處理的 header，且它收集到了一些 paragraph 文字，
                # 那麼就將這個 header 和它的 paragraph 儲存起來。
                if current_header_text is not None:
                    paragraph_content = " ".join(current_paragraphs_texts).strip()
                    extracted_items.append({
                        "header": current_header_text,
                        "paragraph": paragraph_content
                    })
                
                # 開始處理新的 header
                current_header_text = tag.get_text(strip=True)
                current_paragraphs_texts = []  # 重設段落列表給新的 header
            
            elif tag.name == 'p':
                # 如果當前有一個正在處理的 header (即 current_header_text 不是 None)，
                # 就將這個 <p> 標籤的文字加入到當前 header 的段落列表中。
                if current_header_text is not None:
                    current_paragraphs_texts.append(tag.get_text(strip=True))
        
        # 循環結束後，處理最後一個收集到的 header (如果有的話)
        if current_header_text is not None:
            paragraph_content = " ".join(current_paragraphs_texts).strip()
            extracted_items.append({
                "header": current_header_text,
                "paragraph": paragraph_content
            })

        # 準備要儲存到 JSON 的最終資料結構
        data_to_save = {
            "url": url,
            "extracted_content": extracted_items # 這是一個列表，每個元素是 {"header": ..., "paragraph": ...}
        }

        # 將資料寫入 JSON 檔案
        with open(output_filename, 'w', encoding='utf-8') as json_file:
            json.dump(data_to_save, json_file, ensure_ascii=False, indent=4)

        print(f"成功從 {url} 提取 header (<h1>) 和 paragraph (<p>) 內容並儲存到 {output_filename}")
        if not extracted_items:
            print(f"提醒：在 {url} 中沒有找到 <h1> 標籤，或者找到的 <h1> 標籤後沒有緊隨的 <p> 標籤。")
        return True

    except requests.exceptions.Timeout:
        print(f"爬取網頁 {url} 時請求超時。")
        return False
    except requests.exceptions.RequestException as e:
        print(f"爬取網頁 {url} 時發生錯誤: {e}")
        return False
    except IOError as e:
        print(f"寫入 JSON 檔案 {output_filename} 時發生錯誤: {e}")
        return False
    except Exception as e:
        print(f"發生未預期的錯誤: {e}")
        return False

# --- 如何使用 ---
if __name__ == "__main__":
    target_url = input("請輸入你要爬取的網址: ")
    # 你可以自訂輸出的檔案名稱
    output_file = "header_paragraph_structured_data.json"

    if target_url:
        # 確保輸入的 URL 包含協議頭 (http:// 或 https://)
        if not target_url.startswith(('http://', 'https://')):
            target_url = 'http://' + target_url
            print(f"已自動添加 'http://'，目標網址為: {target_url}")
        
        scrape_header_paragraph_to_json(target_url, output_file)
    else:
        print("網址不可為空。")