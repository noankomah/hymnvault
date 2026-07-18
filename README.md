# HymnVault

A lightweight, multilingual digital hymn library platform that enables churches and organizations to publish, manage, and distribute hymn collections through a simple, data-driven architecture.

Unlike traditional hymn applications that tightly couple hymn content to application code, HymnVault separates the software from the hymn data. New hymn books can be added using structured CSV and JSON files without modifying the application's source code, making the platform easy to extend, maintain, and customize.

The project currently includes English, Twi, and Dangme hymn collections and is designed to support additional languages and denominations through a standardized content format.

---

# Live Demo

🌐 https://noankomah.github.io/hymnvault/

---

# Motivation

Many churches continue to rely on printed hymn books or static PDF documents, making hymn collections difficult to search, organize, maintain, or distribute digitally.

While numerous hymn applications exist, most are developed specifically for a single denomination or language, making them difficult to extend without software modifications.

HymnVault was developed to solve this problem by separating hymn content from the application itself.

Instead of hardcoding hymn books into the software, hymn collections are stored as structured CSV and JSON files that are dynamically loaded by the application. This allows churches, ministries, and Christian organizations to build their own digital hymn libraries simply by preparing appropriately formatted content files.

The result is a reusable platform rather than a single hymn application.

---

# Key Features

## Digital Hymn Library

- Multilingual hymn collections
- Dynamic hymn loading
- Structured hymn organization
- Fast search functionality
- Alphabetical browsing
- Hymn number browsing

---

## Reading Experience

- Responsive interface
- Dark mode
- Previous / Next hymn navigation
- Favourite hymns
- Recently viewed hymns
- Clean distraction-free reading layout

---

## Content Management

- Add new hymn collections without changing application code
- Data-driven architecture
- CSV metadata support
- JSON lyric storage
- Automatic collection discovery
- Extensible language support

---

# Supported Languages

The current implementation includes hymn collections in:

- English
- Twi
- Dangme

The architecture allows additional languages to be added using the same file structure.

Examples include:

- French
- German
- Spanish
- Japanese
- Methodist hymn books
- Presbyterian hymn books
- Catholic hymn books
- Organization-specific collections

---

# How HymnVault Works

Rather than storing hymns directly inside JavaScript files, the application loads hymn collections dynamically from structured data files.

```
           genre_list.csv
                  │
                  ▼
     Available Languages
                  │
                  ▼
      Collection List CSV
                  │
                  ▼
      Hymn Lyrics JSON
                  │
                  ▼
      Dynamic Data Loader
                  │
                  ▼
      Search & Navigation
                  │
                  ▼
        Hymn Reader
```

This architecture keeps the application code independent from hymn content, allowing new collections to be added without modifying the software itself.

---

# Why This Architecture?

Separating content from application logic provides several advantages:

- Easier maintenance
- Simple content updates
- Support for multiple hymn collections
- Language independence
- Reusable application core
- Reduced software complexity
- Minimal effort when adding new denominations

Rather than developing separate applications for different hymn books, organizations only need to provide properly formatted content files.

---

# Technology Stack

Frontend

- HTML5
- CSS3
- JavaScript (Vanilla)

Data Storage

- CSV
- JSON

Hosting

- GitHub Pages

---

# Project Structure

```
HymnVault/
│
├── index.html
├── css/
├── js/
├── resources/
│   ├── genre_list.csv
│   ├── *_list.csv
│   ├── *_lyrics.json
│
├── images/
├── README.md
└── LICENSE (planned)
```

---

# Core Design Philosophy

The application follows a simple principle:

> **The software should remain unchanged when new hymn collections are added.**

Instead of editing JavaScript whenever a new denomination or language is introduced, contributors simply prepare structured CSV and JSON files following the documented format.

This makes HymnVault scalable, maintainable, and suitable for organizations that wish to maintain their own digital hymn libraries without modifying application code.

---

# Current Capabilities

The current version supports:

- Dynamic hymn collection loading
- Multilingual hymn libraries
- Search functionality
- Alphabetical sorting
- Hymn number sorting
- Responsive interface
- Favourite hymns
- Recently viewed hymns
- Dark mode
- Mobile-friendly layout


# Managing Hymn Collections

HymnVault is designed so that hymn collections can be expanded without modifying the application's source code.

The application depends on three primary resource files located inside the `resources` directory:

1. `genre_list.csv`
2. Hymn collection list files (`*_list.csv`)
3. Hymn lyrics files (`*_lyrics.json`)

Together, these files define the available languages, hymn collections, hymn titles, and lyrics that are presented within the application.

---

# 1. Genre List

The `genre_list.csv` file defines the available language categories and hymn collections displayed by the application.

Current example:

```csv
English,Twi,Dangme
```

Each column represents a language heading.

Additional languages can be introduced simply by extending this file and providing the corresponding hymn collection files.

---

# 2. Hymn Collection List

Every hymn collection requires a corresponding list file.

File naming convention:

```text
collection_name_list.csv
```

Examples:

```text
soc_list.csv
ss_list.csv
dangme_hymn_list.csv
twi_praises_list.csv
methodist_hymns_list.csv
```

The CSV contains two columns:

```csv
title,number
Amazing Grace,1
How Great Thou Art,2
Blessed Assurance,3
```

Fields:

| Column | Description |
|---------|-------------|
| title | Display title of the hymn |
| number | Hymn number used throughout the application |

This file provides the navigation structure used throughout HymnVault.

---

# 3. Hymn Lyrics

Each hymn collection also requires a matching JSON file containing the complete hymn lyrics.

Naming convention:

```text
collection_name_lyrics.json
```

Examples:

```text
soc_lyrics.json
ss_lyrics.json
dangme_hymn_lyrics.json
methodist_hymns_lyrics.json
```

Example structure:

```json
{
  "1": {
    "english_title": "Amazing Grace",
    "twi_title": "",
    "dangme_title": "",
    "verses": [
      {
        "number": 1,
        "text": "First verse lyrics"
      },
      {
        "number": 2,
        "text": "Second verse lyrics"
      }
    ],
    "chorus": ""
  }
}
```

If a hymn contains a chorus:

```json
"chorus": "Amazing grace, how sweet the sound..."
```

Otherwise:

```json
"chorus": ""
```

Each hymn number in the JSON file should correspond exactly to the hymn number defined in the associated collection CSV file.

---

# File Naming Rules

HymnVault automatically discovers hymn collections using lowercase filenames with underscores replacing spaces.

Examples:

| Collection Name | Required Files |
|-----------------|----------------|
| SS | ss_list.csv / ss_lyrics.json |
| SOC | soc_list.csv / soc_lyrics.json |
| Methodist Hymns | methodist_hymns_list.csv / methodist_hymns_lyrics.json |
| Presbyterian Hymns | presbyterian_hymns_list.csv / presbyterian_hymns_lyrics.json |
| Twi Praises | twi_praises_list.csv / twi_praises_lyrics.json |

If the filenames do not follow this convention, the application will detect the collection but will be unable to load its contents.

---

# Adding a New Hymn Collection

Adding a new collection requires only three steps:

1. Create a collection list CSV.
2. Create the corresponding lyrics JSON file.
3. Register the collection in `genre_list.csv`.

No JavaScript modifications are required.

No HTML modifications are required.

No application recompilation is required.

---

# Local Development

Clone the repository:

```bash
git clone https://github.com/noankomah/HymVault.git
```

Navigate into the project:

```bash
cd HymVault
```

Because the application loads local CSV and JSON resources, it should be served through a local web server rather than opened directly from the filesystem.

Examples include:

```bash
python -m http.server
```

or

Visual Studio Code Live Server.

---

# Typical Applications

HymnVault is suitable for:

- Churches
- Christian organizations
- Bible schools
- Choir ministries
- Conference hymn books
- Multilingual worship services
- Digital hymn archives

---

# Future Improvements

Planned enhancements include:

- Audio playback
- Musical notation support
- Offline Progressive Web App (PWA)
- User-created playlists
- Advanced filtering
- Cloud synchronization
- Scripture references
- Multiple themes
- Print-friendly hymn layouts
- PDF hymn export
- Presentation mode
- Bookmark synchronization

---

# Contributing

Contributions are welcome.

Possible areas for contribution include:

- New hymn collections
- Additional language support
- User interface improvements
- Accessibility enhancements
- Performance optimization
- Documentation improvements

Please ensure that any contributed hymn collections follow the documented CSV and JSON formats to maintain compatibility with the application.

---

# Project Status

Current Status:

✅ Active

Current Version:

**Version 1.0**

The project is stable and functional while continuing to evolve with additional hymn collections and usability improvements.

---

# Author

Developed and maintained by **Nana Ankomah**.

---

# License

This project is licensed under the **MIT License**.
