import json
import os
import subprocess
from pathlib import Path

# Configuration
DATA_FILE = Path("src/data/portfolio.json")
IMAGE_DIR = Path("public/gallery")
REPO_ROOT = Path("C:/Users/Sechio/Documents/Portofolio art")

def main():
    print("--- Portfolio Gallery Manager ---")
    
    # 1. Load existing data
    if DATA_FILE.exists():
        with open(DATA_FILE, "r") as f:
            portfolio = json.load(f)
    else:
        portfolio = []

    # 2. Add new artwork
    new_art = {
        "title": input("Enter title: "),
        "category": input("Enter category: "),
        "image": input("Enter filename (in public/gallery/): ")
    }
    
    portfolio.append(new_art)
    
    # 3. Preview
    print("\n--- Preview ---")
    print(json.dumps(portfolio, indent=2))
    
    confirm = input("\nSave and commit to GitHub? (y/n): ")
    if confirm.lower() == 'y':
        # Save
        with open(DATA_FILE, "w") as f:
            json.dump(portfolio, f, indent=2)
        
        # Git operations (assuming git/gh are installed and configured)
        os.chdir(REPO_ROOT)
        subprocess.run(["git", "add", str(DATA_FILE.relative_to(REPO_ROOT))])
        subprocess.run(["git", "commit", "-m", f"Add artwork: {new_art['title']}"])
        subprocess.run(["git", "push"])
        print("Successfully pushed to GitHub.")
    else:
        print("Changes discarded.")

if __name__ == "__main__":
    main()
