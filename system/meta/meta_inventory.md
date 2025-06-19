# Clara KI System Inventory

## Overview
This document provides a comprehensive inventory of the Clara KI system components, their locations, and their purposes.

## System Architecture

### UI Routes
- `/clara-ki`: TyrionX UI with integrated Legacy functionality
- `/clara-ki-react`: Development branch for React-based UI (not yet fully functional)
- `/clara-ki-legacy`: Fallback for functional DOM-based UI

### Directory Structure
- `/var/www/clara360/clara-ki/`: Main Clara KI UI
- `/var/www/clara360/system/`: System components (JSON engine, voice, integration)
- `/var/www/clara360/lib/`: Library components (dialog context)
- `/var/www/clara360/data/`: Data files (responses JSON)
- `/var/www/clara360/backup/`: Backup files
- `/var/www/clara360/system/meta/`: Meta documentation

## Component Inventory

### Core Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `clara_json_engine.js` | `/system/` | JSON-based response engine |
| `clara_voice.js` | `/system/` | Voice recognition and synthesis |
| `clara_dialog_context.js` | `/lib/` | Conversation context management |
| `clara_integration.js` | `/system/` | Main integration module |
| `clara_styles.css` | `/clara-ki/assets/` | UI styling |
| `clara_ki_responses.json` | `/data/` | Response data |
| `manifest_ui_routes.json` | `/` | UI route mapping |

### UI Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `index.html` | `/clara-ki/` | Main UI entry point |
| `assets/` | `/clara-ki/assets/` | UI assets (CSS, images) |

### Backup Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `clara-ki-before-fusion/` | `/backup/` | Backup of original UI before integration |

## Functionality Overview

### JSON Engine
The JSON engine provides intelligent responses based on user input. It matches keywords in user messages to predefined intents and returns appropriate responses.

### Voice Module
The voice module provides speech recognition and synthesis capabilities. It allows users to interact with Clara KI using voice commands and receive spoken responses.

### Dialog Context
The dialog context module manages conversation history and context. It enhances responses based on previous interactions and maintains topic awareness.

### Integration Module
The integration module connects all components and provides a unified interface for the Clara KI system. It handles DOM integration, event handling, and UI updates.

## Dependencies

### External APIs
- Web Speech API for voice recognition and synthesis

### Browser Requirements
- Modern browser with JavaScript enabled
- Web Speech API support for voice functionality

## Backup and Recovery
- Original UI backed up to `/var/www/clara360/backup/clara-ki-before-fusion/`
- Can be restored if needed

## Maintenance
- Regular updates to `clara_ki_responses.json` for new responses
- Monitoring of browser console for errors
- Testing of voice functionality in different browsers

