#!/bin/bash
# Helper script for transferring files via git when SSH is not available

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TRANSFERS_DIR="$REPO_ROOT/06_SCANS/INBOX/transfers"

show_help() {
    cat << EOF
File Transfer Helper (No SSH Required)

Usage: $0 [COMMAND] [OPTIONS]

COMMANDS:
    upload <file>   - Upload a file to the transfers directory and push to remote
    download        - Pull from remote and show available files in transfers
    list            - List files currently in transfers directory
    cleanup         - Remove all files from transfers directory and push changes
    help            - Show this help message

EXAMPLES:
    # Upload a file
    $0 upload myfile.zip

    # Download files from remote
    $0 download

    # List available files
    $0 list

    # Clean up after transfer is complete
    $0 cleanup

NOTES:
    - This is for transferring files when SSH is not available
    - Use only for non-sensitive files
    - Clean up regularly to avoid repository bloat
    - See 06_SCANS/INBOX/transfers/README.md for security guidelines

EOF
}

check_git_status() {
    if ! git -C "$REPO_ROOT" rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not in a git repository"
        exit 1
    fi
}

upload_file() {
    local file="$1"
    
    if [ -z "$file" ]; then
        echo "Error: No file specified"
        echo "Usage: $0 upload <file>"
        exit 1
    fi
    
    if [ ! -f "$file" ]; then
        echo "Error: File not found: $file"
        exit 1
    fi
    
    local basename=$(basename "$file")
    local dest="$TRANSFERS_DIR/$basename"
    
    echo "Copying $file to transfers directory..."
    cp "$file" "$dest"
    
    echo "Adding to git..."
    git -C "$REPO_ROOT" add "$dest"
    
    echo "Committing..."
    git -C "$REPO_ROOT" commit -m "Transfer: Upload $basename"
    
    echo "Pushing to remote..."
    git -C "$REPO_ROOT" push
    
    echo "✓ File uploaded successfully: $basename"
    echo "  Recipients can retrieve it by running: $0 download"
}

download_files() {
    echo "Pulling from remote..."
    git -C "$REPO_ROOT" pull
    
    echo ""
    echo "Available files in transfers directory:"
    echo "========================================"
    
    if [ -d "$TRANSFERS_DIR" ]; then
        local count=0
        for file in "$TRANSFERS_DIR"/*; do
            if [ -f "$file" ] && [ "$(basename "$file")" != ".gitkeep" ] && [ "$(basename "$file")" != "README.md" ]; then
                local basename=$(basename "$file")
                local size=$(du -h "$file" | cut -f1)
                echo "  $basename ($size)"
                ((count++))
            fi
        done
        
        if [ $count -eq 0 ]; then
            echo "  (No files available)"
        else
            echo ""
            echo "Files are located in: $TRANSFERS_DIR"
        fi
    else
        echo "  (Transfers directory not found)"
    fi
}

list_files() {
    echo "Files in transfers directory:"
    echo "============================="
    
    if [ -d "$TRANSFERS_DIR" ]; then
        local count=0
        for file in "$TRANSFERS_DIR"/*; do
            if [ -f "$file" ] && [ "$(basename "$file")" != ".gitkeep" ] && [ "$(basename "$file")" != "README.md" ]; then
                local basename=$(basename "$file")
                local size=$(du -h "$file" | cut -f1)
                local date=$(stat -c '%y' "$file" 2>/dev/null || stat -f '%Sm' "$file" 2>/dev/null || echo "unknown")
                echo "  $basename"
                echo "    Size: $size"
                echo "    Modified: ${date:0:19}"
                echo ""
                ((count++))
            fi
        done
        
        if [ $count -eq 0 ]; then
            echo "  (No files)"
        fi
    else
        echo "  (Transfers directory not found)"
    fi
}

cleanup_files() {
    echo "Cleaning up transfers directory..."
    
    local count=0
    for file in "$TRANSFERS_DIR"/*; do
        if [ -f "$file" ] && [ "$(basename "$file")" != ".gitkeep" ] && [ "$(basename "$file")" != "README.md" ]; then
            local basename=$(basename "$file")
            echo "  Removing: $basename"
            rm "$file"
            ((count++))
        fi
    done
    
    if [ $count -eq 0 ]; then
        echo "  No files to clean up"
        exit 0
    fi
    
    echo ""
    echo "Adding changes to git..."
    git -C "$REPO_ROOT" add "$TRANSFERS_DIR"
    
    echo "Committing..."
    git -C "$REPO_ROOT" commit -m "Transfer: Cleanup - removed $count file(s)"
    
    echo "Pushing to remote..."
    git -C "$REPO_ROOT" push
    
    echo "✓ Cleanup complete: $count file(s) removed"
}

# Main script
check_git_status

case "${1:-help}" in
    upload)
        upload_file "$2"
        ;;
    download)
        download_files
        ;;
    list)
        list_files
        ;;
    cleanup)
        cleanup_files
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Error: Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
