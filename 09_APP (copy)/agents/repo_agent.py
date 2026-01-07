#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Repo Agent - Guided File Intake & Routing
------------------------------------------
Detects new files, asks for classification, optional notes, and shows processing info.
Routes files to appropriate handlers (OCR, DB builder, etc.)
"""

import os
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# --- CONFIG ---
REPO_ROOT = Path(__file__).parent.parent.parent
WATCH_DIR = REPO_ROOT / "09_APP" / "Generated"
DATABASE_DIR = REPO_ROOT / "09_APP" / "Database"
LOG_FILE = DATABASE_DIR / "intake_log.json"
STATUS_FILE = DATABASE_DIR / "processing_status.json"
AGENTS_CONFIG = REPO_ROOT / "09_APP" / "agents" / "agents_config.json"

CATEGORIES = ["Communication", "Evidence", "Timeline", "Court Filing", "Incident", "Note", "Other"]
SUPPORTED_FORMATS = {
    ".csv": {"handler": "master_case_db_builder", "destination": "Database", "action": "merge"},
    ".pdf": {"handler": "standalone_ocr", "destination": "Database", "action": "extract_text"},
    ".jpg": {"handler": "standalone_ocr", "destination": "Database", "action": "extract_text"},
    ".jpeg": {"handler": "standalone_ocr", "destination": "Database", "action": "extract_text"},
    ".png": {"handler": "standalone_ocr", "destination": "Database", "action": "extract_text"},
    ".tif": {"handler": "standalone_ocr", "destination": "Database", "action": "extract_text"},
    ".tiff": {"handler": "standalone_ocr", "destination": "Database", "action": "extract_text"},
    ".docx": {"handler": "text_extractor", "destination": "Database", "action": "extract_text"},
    ".txt": {"handler": "text_processor", "destination": "Database", "action": "index"},
}

# --- Helpers ---
def ensure_dirs():
    """Create necessary directories"""
    WATCH_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)

def load_log() -> List[Dict]:
    """Load intake log"""
    if LOG_FILE.exists():
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_log(entries: List[Dict]):
    """Save intake log"""
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)

def update_status(filename: str, status: str, details: str = ""):
    """Update processing status"""
    status_data = {}
    if STATUS_FILE.exists():
        with open(STATUS_FILE, 'r', encoding='utf-8') as f:
            status_data = json.load(f)
    
    status_data[filename] = {
        "status": status,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    
    with open(STATUS_FILE, 'w', encoding='utf-8') as f:
        json.dump(status_data, f, indent=2, ensure_ascii=False)

def multi_select_categories() -> List[str]:
    """Interactive multi-select category selection"""
    print("\n" + "="*60)
    print("📋 CLASSIFY THIS FILE")
    print("="*60)
    print("\nSelect all that apply:")
    for i, cat in enumerate(CATEGORIES, 1):
        print(f"  {i}. {cat}")
    print("  0. Done\n")
    
    chosen = []
    while True:
        try:
            val = input("Select number (0 to finish): ").strip()
            if val == "0":
                break
            idx = int(val)
            if 1 <= idx <= len(CATEGORIES):
                item = CATEGORIES[idx - 1]
                if item not in chosen:
                    chosen.append(item)
                    print(f"  ✅ Added {item}")
                else:
                    chosen.remove(item)
                    print(f"  ❌ Removed {item}")
            else:
                print("❌ Invalid choice. Try again.")
        except ValueError:
            print("❌ Please enter a number.")
        except KeyboardInterrupt:
            print("\n\n⚠️  Cancelled by user.")
            return []
    
    return chosen if chosen else ["Uncategorized"]

def reflexive_logic_check(categories: List[str]) -> Tuple[List[str], List[str]]:
    """Check logic consistency and suggest missing categories"""
    flags = []
    updated_categories = categories.copy()
    
    # Check: Incident without Evidence
    if "Incident" in categories and "Evidence" not in categories:
        print("\n⚠️  You marked this as an Incident but not as Evidence.")
        response = input("Do you have supporting documents or screenshots? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            if "Evidence" not in updated_categories:
                updated_categories.append("Evidence")
                print("  ✅ Added Evidence")
        else:
            flags.append("needs_evidence")
            print("  ⚠️  Flagged: needs_evidence")
    
    # Check: Evidence without Incident
    if "Evidence" in categories and "Incident" not in categories:
        print("\n⚠️  You marked this as Evidence but not linked to an Incident.")
        response = input("Would you like to link it to an earlier event? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            flags.append("link_required")
            print("  ⚠️  Flagged: link_required")
        else:
            flags.append("unlinked_evidence")
            print("  ⚠️  Flagged: unlinked_evidence")
    
    # Check: Communication without context
    if "Communication" in categories and "Incident" not in categories and "Evidence" not in categories:
        response = input("\n💡 This communication might relate to an incident. Add Incident? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            if "Incident" not in updated_categories:
                updated_categories.append("Incident")
                print("  ✅ Added Incident")
    
    return updated_categories, flags

def get_note() -> Tuple[str, str]:
    """Get optional note (voice or typed)"""
    print("\n" + "="*60)
    print("🗒️  OPTIONAL NOTE")
    print("="*60)
    print("Would you like to attach a note?")
    print("  1. 🎙️  Record Voice (requires microphone)")
    print("  2. ✏️  Type Note")
    print("  3. 🚫 Skip")
    
    while True:
        try:
            choice = input("\nSelect number: ").strip()
            if choice == "1":
                note = record_voice_note()
                return (note, "voice")
            elif choice == "2":
                print("\nType your note (press Enter twice to finish):")
                lines = []
                while True:
                    line = input()
                    if line == "" and lines:
                        break
                    lines.append(line)
                note = "\n".join(lines)
                return (note, "typed")
            elif choice == "3":
                return ("", "none")
            else:
                print("❌ Invalid choice. Try again.")
        except KeyboardInterrupt:
            print("\n\n⚠️  Cancelled by user.")
            return ("", "none")

def record_voice_note() -> str:
    """Record voice note (placeholder - would integrate with speech-to-text)"""
    print("\n🎤 Voice recording not yet implemented.")
    print("💡 For now, please type your note instead.")
    print("\nType your note (press Enter twice to finish):")
    lines = []
    while True:
        line = input()
        if line == "" and lines:
            break
        lines.append(line)
    return "\n".join(lines)

def get_file_info(filepath: Path) -> Dict:
    """Get file metadata and routing info"""
    ext = filepath.suffix.lower()
    file_info = {
        "filename": filepath.name,
        "path": str(filepath),
        "size": filepath.stat().st_size,
        "extension": ext,
        "modified": datetime.fromtimestamp(filepath.stat().st_mtime).isoformat(),
    }
    
    if ext in SUPPORTED_FORMATS:
        file_info.update(SUPPORTED_FORMATS[ext])
        file_info["can_process"] = True
        file_info["reason"] = f"Supported format: {ext}"
    else:
        file_info["can_process"] = False
        file_info["reason"] = f"Unsupported format: {ext}"
        file_info["handler"] = None
        file_info["destination"] = "Generated"
        file_info["action"] = "skip"
    
    return file_info

def show_processing_info(file_info: Dict, category: str, note: str):
    """Display processing information"""
    print("\n" + "="*60)
    print("⚙️  PROCESSING INFORMATION")
    print("="*60)
    
    if file_info["can_process"]:
        print(f"✅ File: {file_info['filename']}")
        print(f"📋 Category: {category}")
        print(f"📍 Destination: {DATABASE_DIR / file_info['destination']}")
        print(f"🔧 Handler: {file_info['handler']}")
        print(f"⚡ Action: {file_info['action']}")
        print(f"🕓 ETA: <instant>")
        if note:
            print(f"📝 Note: {note[:50]}..." if len(note) > 50 else f"📝 Note: {note}")
    else:
        print(f"⚠️  File: {file_info['filename']}")
        print(f"❌ Status: Cannot process")
        print(f"💡 Reason: {file_info['reason']}")
        print(f"💡 Suggestion: Convert to supported format or use manual processing")
    
    print("="*60)

def route_file(file_info: Dict, category: str, note: str) -> bool:
    """Route file to appropriate handler"""
    if not file_info["can_process"]:
        update_status(file_info["filename"], "rejected", file_info["reason"])
        return False
    
    handler = file_info["handler"]
    action = file_info["action"]
    
    # Map handlers to actual scripts
    handler_paths = {
        "master_case_db_builder": REPO_ROOT / "09_APP" / "master_case_db_builder.py",
        "standalone_ocr": REPO_ROOT / "09_APP" / "ocr_processor" / "standalone_ocr.py",
        "text_extractor": None,  # Placeholder
        "text_processor": None,  # Placeholder
    }
    
    handler_path = handler_paths.get(handler)
    
    if handler_path and handler_path.exists():
        try:
            print(f"\n🔄 Running handler: {handler}...")
            result = subprocess.run(
                ["python3", str(handler_path), str(file_info["path"])],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                update_status(file_info["filename"], "processed", f"Handler: {handler}, Action: {action}")
                print(f"✅ Processing complete")
                return True
            else:
                update_status(file_info["filename"], "error", f"Handler failed: {result.stderr}")
                print(f"❌ Processing failed: {result.stderr}")
                return False
        except subprocess.TimeoutExpired:
            update_status(file_info["filename"], "timeout", "Handler exceeded 5 minute timeout")
            print(f"⏱️  Processing timeout")
            return False
        except Exception as e:
            update_status(file_info["filename"], "error", str(e))
            print(f"❌ Error: {e}")
            return False
    else:
        # Handler not found, but log the file anyway
        update_status(file_info["filename"], "queued", f"Handler '{handler}' not found, but file logged")
        print(f"⚠️  Handler '{handler}' not found, but file logged for manual processing")
        return True

def process_file(filepath: Path) -> bool:
    """Process a single file through the intake flow with reflexive logic checks"""
    file_info = get_file_info(filepath)
    
    print("\n" + "="*60)
    print(f"📁 NEW FILE DETECTED")
    print("="*60)
    print(f"File: {file_info['filename']}")
    print(f"Size: {file_info['size']:,} bytes")
    print(f"Type: {file_info['extension']}")
    
    # Multi-select classification
    categories = multi_select_categories()
    if not categories:
        print("⚠️  No categories selected. Using 'Uncategorized'")
        categories = ["Uncategorized"]
    
    # Reflexive logic check
    categories, flags = reflexive_logic_check(categories)
    
    # Optional note
    note, note_type = get_note()
    
    # Show processing info
    category_str = "; ".join(categories)
    show_processing_info(file_info, category_str, note)
    
    # Confirm
    print("\n" + "="*60)
    confirm = input("Proceed with this classification and routing? (y/n): ").strip().lower()
    if confirm not in ['y', 'yes']:
        print("⚠️  Cancelled by user.")
        return False
    
    # Route file
    success = route_file(file_info, category_str, note)
    
    # GUARANTEED TIMELINE LOGGING - Everything gets added, even if processing fails
    timeline_entry = {
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Time": datetime.now().strftime("%H:%M:%S"),
        "Filename": file_info["filename"],
        "Categories": "; ".join(categories),
        "Flags": "; ".join(flags) if flags else "",
        "Note": note or "(none)",
        "Destination": file_info["destination"],
        "SourcePath": str(filepath),
        "Status": "processed" if success else "error",
        "Handler": file_info.get("handler", ""),
        "Action": file_info.get("action", "")
    }
    
    # Append to timeline CSV
    timeline_file = DATABASE_DIR / "Master_CaseDB.csv"
    timeline_file.parent.mkdir(parents=True, exist_ok=True)
    
    import csv
    file_exists = timeline_file.exists()
    with open(timeline_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=timeline_entry.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(timeline_entry)
    
    # Log entry
    entry = {
        "filename": file_info["filename"],
        "path": str(filepath),
        "categories": categories,
        "flags": flags,
        "note": note,
        "note_type": note_type,
        "timestamp": datetime.now().isoformat(),
        "destination": file_info["destination"],
        "handler": file_info["handler"],
        "action": file_info["action"],
        "can_process": file_info["can_process"],
        "reason": file_info.get("reason", ""),
        "status": "processed" if success else "error",
        "size": file_info["size"],
        "extension": file_info["extension"]
    }
    
    log_entries = load_log()
    log_entries.append(entry)
    save_log(log_entries)
    
    print(f"\n✅ Entry logged to timeline: {timeline_file}")
    print(f"✅ Entry logged to intake log: {LOG_FILE}")
    if flags:
        print(f"⚠️  Flags: {', '.join(flags)}")
    return True

def check_updates():
    """Check for note updates and OCR outputs"""
    update_marker = DATABASE_DIR / "case_updates.json"
    if not update_marker.exists():
        return
    
    try:
        with open(update_marker, 'r', encoding='utf-8') as f:
            update = json.load(f)
        
        if update.get("type") == "new_note":
            print(f"\n📝 Detected note update for event {update.get('eventId', 'unknown')}")
            if update.get('linked'):
                print(f"   Linked to: {update.get('linked')}")
            
            # Merge any new note CSV into timeline
            note_csv = WATCH_DIR / "NewNote.csv"
            if note_csv.exists():
                timeline_file = DATABASE_DIR / "Master_CaseDB.csv"
                if timeline_file.exists():
                    import csv
                    with open(note_csv, 'r', encoding='utf-8') as nf:
                        reader = csv.DictReader(nf)
                        with open(timeline_file, 'a', newline='', encoding='utf-8') as tf:
                            writer = csv.DictWriter(tf, fieldnames=reader.fieldnames)
                            for row in reader:
                                writer.writerow(row)
                    note_csv.unlink()
                    print("   ✅ Merged note into timeline")
        
        # Check for OCR outputs
        ocr_pattern = WATCH_DIR / "OCR_*.csv"
        import glob
        for ocr_file in glob.glob(str(ocr_pattern)):
            ocr_path = Path(ocr_file)
            if ocr_path.stat().st_mtime > time.time() - 60:  # New in last minute
                print(f"\n📄 Detected OCR output: {ocr_path.name}")
                timeline_file = DATABASE_DIR / "Master_CaseDB.csv"
                if timeline_file.exists():
                    import csv
                    with open(ocr_path, 'r', encoding='utf-8') as of:
                        reader = csv.DictReader(of)
                        with open(timeline_file, 'a', newline='', encoding='utf-8') as tf:
                            writer = csv.DictWriter(tf, fieldnames=reader.fieldnames)
                            for row in reader:
                                writer.writerow(row)
                    print("   ✅ Merged OCR output into timeline")
        
        update_marker.unlink()
    except Exception as e:
        print(f"⚠️  Error processing update: {e}")

def watch_loop():
    """Main watch loop with update checking"""
    ensure_dirs()
    
    seen = set()
    log_entries = load_log()
    for entry in log_entries:
        seen.add(entry["filename"])
    
    print("🚀 Reflexive Intake Agent started")
    print(f"📂 Watching: {WATCH_DIR}")
    print(f"💾 Database: {DATABASE_DIR}")
    print(f"📋 Log: {LOG_FILE}")
    print("\n" + "="*60)
    print("Waiting for new files...")
    print("(Press Ctrl+C to stop)")
    print("="*60 + "\n")
    
    try:
        while True:
            # Check for note updates and OCR outputs
            check_updates()
            
            if not WATCH_DIR.exists():
                WATCH_DIR.mkdir(parents=True, exist_ok=True)
            
            for filepath in WATCH_DIR.iterdir():
                if not filepath.is_file():
                    continue
                
                if filepath.name.startswith('.'):
                    continue
                
                # Skip already processed note files
                if filepath.name in ["NewNote.csv", "case_updates.json"]:
                    continue
                
                if filepath.name not in seen:
                    process_file(filepath)
                    seen.add(filepath.name)
                    print("\n" + "="*60)
                    print("Waiting for next file...")
                    print("="*60 + "\n")
            
            time.sleep(3)
            
    except KeyboardInterrupt:
        print("\n\n👋 Repo Agent stopped by user.")
        print(f"📋 Log saved to: {LOG_FILE}")
        print(f"⚙️  Status saved to: {STATUS_FILE}")

def process_single_file(filepath: str):
    """Process a single file (for manual invocation)"""
    ensure_dirs()
    path = Path(filepath)
    if not path.exists():
        print(f"❌ File not found: {filepath}")
        return
    
    process_file(path)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Process single file
        process_single_file(sys.argv[1])
    else:
        # Watch mode
        watch_loop()

