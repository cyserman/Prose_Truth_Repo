#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Orchestrator
-------------------
Loads agent configs and runs them sequentially or on trigger.
"""

import json
import subprocess
import os
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = REPO_ROOT / "09_APP" / "agents" / "agents_config.json"

def load_config():
    """Load agents configuration"""
    if not CONFIG_FILE.exists():
        print(f"⚠️  Config file not found: {CONFIG_FILE}")
        print("💡 Creating default config...")
        default_config = {
            "agents": [
                {
                    "name": "Repo Agent",
                    "path": "09_APP/agents/repo_agent.py",
                    "auto": False,
                    "trigger": "manual"
                }
            ]
        }
        with open(CONFIG_FILE, 'w') as f:
            json.dump(default_config, f, indent=2)
        return default_config
    
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)

def run_agent(agent):
    """Run a single agent"""
    name = agent["name"]
    path = agent["path"]
    trigger = agent.get("trigger", "manual")
    
    # Resolve path relative to repo root
    full_path = REPO_ROOT / path
    
    if not full_path.exists():
        print(f"⚠️  Agent script not found: {full_path}")
        return False
    
    print(f"\n▶ Running agent: {name} [{trigger}]")
    print(f"   Path: {full_path}")
    
    try:
        if path.endswith(".py"):
            result = subprocess.run(
                ["python3", str(full_path)],
                cwd=str(REPO_ROOT),
                timeout=600
            )
            return result.returncode == 0
        elif path.endswith(".sh"):
            result = subprocess.run(
                ["bash", str(full_path)],
                cwd=str(REPO_ROOT),
                timeout=600
            )
            return result.returncode == 0
        else:
            print(f"⚠️  Unknown agent type: {path}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏱️  Agent timeout (exceeded 10 minutes)")
        return False
    except Exception as e:
        print(f"❌ Error running agent: {e}")
        return False

def main():
    """Main orchestrator loop"""
    config = load_config()
    
    print("🚀 Agent Orchestrator")
    print("=" * 60)
    print(f"📋 Config: {CONFIG_FILE}")
    print(f"📂 Repo Root: {REPO_ROOT}")
    print("=" * 60)
    
    agents = config.get("agents", [])
    
    if not agents:
        print("⚠️  No agents configured")
        return
    
    print(f"\n📊 Found {len(agents)} agent(s):\n")
    for i, agent in enumerate(agents, 1):
        auto = "🟢 AUTO" if agent.get("auto", False) else "🕹️  MANUAL"
        print(f"  {i}. {agent['name']} - {auto}")
        print(f"     Trigger: {agent.get('trigger', 'manual')}")
        if 'description' in agent:
            print(f"     {agent['description']}")
        print()
    
    # Run auto agents
    auto_agents = [a for a in agents if a.get("auto", False)]
    if auto_agents:
        print("🔄 Running auto agents...\n")
        for agent in auto_agents:
            run_agent(agent)
    else:
        print("🕹️  No auto agents configured. Use manual mode:")
        print("\nTo run a specific agent:")
        print("  python3 09_APP/agents/repo_agent.py")
        print("\nOr edit agents_config.json to set 'auto': true")

if __name__ == "__main__":
    main()

