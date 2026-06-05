# HymnVault

HymnVault is a hosted multilingual hymn web app for English, Twi, and Dangme hymns. It is built to work as a flexible hymn vault where hymn collections can be added through structured CSV and JSON files.

The app separates the hymn content from the core interface. This means new hymn collections can be added by placing properly formatted files in the `resources` folder, and the site will load and render them dynamically.

## Live Site

https://noankomah.github.io/hymnvault/

## Features

- Multilingual hymn support
- English, Twi, and Dangme hymn collections
- Genre-based hymn organization
- Dynamic rendering from CSV and JSON files
- Search functionality
- Sort hymns alphabetically or by hymn number
- Previous and next hymn navigation
- Favourites
- Singlist
- Recently viewed hymns
- Dark mode
- Mobile-friendly interface

## Tech Stack

- HTML
- CSS
- JavaScript
- CSV
- JSON
- GitHub Pages

## How HymnVault Loads Hymn Collections

HymnVault is designed so that hymn content can be expanded without rewriting the main application code.

The app depends on three main types of files inside the `resources` folder:

1. `genre_list.csv`
2. hymn collection list files
3. hymn lyrics JSON files

## 1. The `genre_list.csv` File

The `genre_list.csv` file controls the languages and the hymn collections that appear in the app.

At the moment, the active language headings are:

```csv
English,Twi,Dangme


## Hymn List CSV Format

Each hymn collection must have a list CSV file. This file contains the hymn titles and hymn numbers.

The file name must follow this pattern:

```text
collection_name_list.csv
```

Example:

```text
ss_list.csv
soc_list.csv
twi_praises_list.csv
dangme_hymn_list.csv
```

The CSV should have two columns:

```csv
title,number
Amazing Grace,1
How Great Thou Art,2
Blessed Assurance,3
```

The title comes first, and the hymn number comes last.

HymnVault reads each row and displays the hymn title and number in the hymn list view.


## Hymn Lyrics JSON Format

Each hymn collection must also have a matching lyrics JSON file.

The file name must follow this pattern:

```text
collection_name_lyrics.json
```

Example:

```text
ss_lyrics.json
soc_lyrics.json
twi_praises_lyrics.json
dangme_hymn_lyrics.json
```

The JSON file uses the hymn number as the main key.

Example:

```json
{
  "1": {
    "english_title": "Amazing Grace",
    "twi_title": "",
    "dangme_title": "",
    "verses": [
      {
        "number": 1,
        "text": "First verse lyrics go here"
      },
      {
        "number": 2,
        "text": "Second verse lyrics go here"
      }
    ],
    "chorus": ""
  }
}
```

If the hymn has a chorus, add it here:

```json
"chorus": "Chorus lyrics go here"
```

If the hymn has no chorus, leave it empty:

```json
"chorus": ""
```

Each hymn number in the list CSV should match the hymn number used in the lyrics JSON file.


## File Naming Rules

HymnVault looks for collection files using a lowercase-and-underscore naming pattern.

This means the collection name in `genre_list.csv` determines the file names the app will try to load.

Examples:

```text
SS                    → ss_list.csv / ss_lyrics.json
SOC                   → soc_list.csv / soc_lyrics.json
Twi Praises           → twi_praises_list.csv / twi_praises_lyrics.json
Dangme Hymn           → dangme_hymn_list.csv / dangme_hymn_lyrics.json
Methodist Hymns       → methodist_hymns_list.csv / methodist_hymns_lyrics.json
Presbyterian Hymns    → presbyterian_hymns_list.csv / presbyterian_hymns_lyrics.json
```

You must save the CSV and JSON files using this same naming style.

For example, if you add this collection name to `genre_list.csv`:

```text
Methodist Hymns
```

then the matching files must be saved as:

```text
methodist_hymns_list.csv
methodist_hymns_lyrics.json
```

If the file names do not match this pattern, HymnVault will show the collection name but will not be able to load the hymn list or lyrics.


## Author

Developed and maintained by Nana Ankomah.

## Rights

This repository is publicly available for review and reference. No open-source license has been granted. All rights reserved.
