import os
import json
from openai import OpenAI

print("✅ 脚本开始运行")
print("✅ 成功导入 OpenAI 库")

# OpenRouter 的固定 API 地址
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
print("✅ 设置了 OpenRouter base_url")

# 检查密钥是否读取成功
api_key = os.environ.get("OPENROUTER_API_KEY")
print(f"✅ 读取到的 API 密钥前缀: {api_key[:10] if api_key else '未找到密钥'}")

if not api_key:
    print("❌ 错误：没有找到 OPENROUTER_API_KEY 环境变量")
    exit(1)

print("🔐 配置 OpenRouter 客户端...")

client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=api_key,
    # *** 关键修改：添加 OpenRouter 推荐的头部信息 ***
    default_headers={
        "HTTP-Referer": "http://localhost:8080",  # 随便填一个 URL
        "X-Title": "Interactive Tech Demo"        # 随便填一个应用名
    }
)

print("✅ 成功创建 OpenAI 客户端")

# 实际调用 AI 模型的代码
try:
    print("📡 正在发送请求到 OpenRouter...")
    response = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct",
        messages=[
            {"role": "system", "content": "你是一个交互技术专家。"},
            {"role": "user", "content": "请用一句话介绍交互技术。"}
        ],
        max_tokens=200,
        temperature=0.7
    )
    
    print("✅ 收到完整响应！")
    
    # 检查响应内容
    if response.choices and len(response.choices) > 0:
        content = response.choices[0].message.content
        if content and len(content.strip()) > 0:
            print("--- AI 响应 ---")
            print(content)
        else:
            print("❌ 响应内容为空字符串")
            print("--- 完整响应对象 ---")
            print(json.dumps(response.model_dump(), indent=2, ensure_ascii=False))
    else:
        print("❌ 响应没有 choices 数据")
        print("--- 完整响应对象 ---")
        print(json.dumps(response.model_dump(), indent=2, ensure_ascii=False))

except Exception as e:
    print(f"❌ 调用失败: {e}")
    import traceback
    traceback.print_exc()
