#!/usr/bin/env python3
"""
TikTok参考画像からUIを削除し、髪色・背景を変更するスクリプト
"""
import os
import sys
from pathlib import Path
from PIL import Image

# Gemini API
from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyA-dK9quwqZJoxX9rvYcwEhrkp0XOBpqYg")
client = genai.Client(api_key=API_KEY)

# 入力・出力フォルダ
INPUT_DIR = Path("/Users/kaiseiyamaguchi/アクセルシフト/新規事業/kaminokoe/集客/04_tiktok/参考画像")
OUTPUT_DIR = Path("/Users/kaiseiyamaguchi/アクセルシフト/新規事業/kaminokoe/集客/04_tiktok/processed_images")
OUTPUT_DIR.mkdir(exist_ok=True)

# 処理プロンプト
PROMPT = """
この画像はTikTokのスクリーンショットです。以下の処理を行ってください：

1. TikTokのUI要素をすべて削除してください：
   - 上部のステータスバー（時計、電池アイコンなど）
   - 検索窓
   - 右側のいいね、コメント、シェア、お気に入りボタンとその数字
   - 下部のプロフィール情報（ユーザー名、日付など）
   - キャプションテキスト
   - 音楽情報
   - コメント入力欄

2. 削除した部分は、自然な背景で埋めてください

3. 人物の顔の形、目、鼻、口、表情は一切変更しないでください

4. 髪の色を少し変化させてください（現在の色から微妙に違う色調に）

5. 服の色を変化させてください（現在の色とは違う色に）

6. 背景の色調や雰囲気を少し変化させてください

元の画像のアスペクト比（縦長）を維持してください。
"""

def process_image(input_path: Path) -> Path:
    """画像を処理してUI削除・髪色背景変更を行う"""
    print(f"Processing: {input_path.name}")

    # 画像を読み込む
    img = Image.open(input_path)

    # Gemini APIで処理
    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[PROMPT, img],
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE'],
        ),
    )

    # 結果を保存
    output_path = OUTPUT_DIR / f"processed_{input_path.stem}.jpg"

    for part in response.parts:
        if part.text:
            print(f"  Response: {part.text[:100]}...")
        elif part.inline_data:
            result_img = part.as_image()
            result_img.save(str(output_path))
            print(f"  Saved: {output_path}")
            return output_path

    print(f"  Warning: No image generated for {input_path.name}")
    return None

def main():
    # 入力画像を取得
    images = list(INPUT_DIR.glob("*.png")) + list(INPUT_DIR.glob("*.jpg"))
    print(f"Found {len(images)} images to process")

    # 全画像を処理
    print(f"Processing all {len(images)} images...")

    results = []
    for img_path in images:
        # 既に処理済みならスキップ
        output_path = OUTPUT_DIR / f"processed_{img_path.stem}.jpg"
        if output_path.exists():
            print(f"Skipping (already processed): {img_path.name}")
            results.append(output_path)
            continue
        try:
            result = process_image(img_path)
            if result:
                results.append(result)
        except Exception as e:
            print(f"  Error processing {img_path.name}: {e}")

    print(f"\nCompleted: {len(results)}/{len(images)} images processed")
    print(f"Output folder: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
