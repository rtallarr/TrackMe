![Static Badge](https://img.shields.io/badge/Next.js-15-blue)
![Static Badge](https://img.shields.io/badge/Tailwind-4-blue)

# TrackMe

App to generate statistics about yourself

## Idea

To provide users with a centralized dashboard to track their digital activity across different platforms like music streaming, gaming, and social media. By pulling data from APIs such as Spotify, Steam, GitHub, Chess.com, etc, it could generate personalized insights, trends, and visualizations. The goal would be to offer users an easy way to view their online habits all in one place, removing the need to check multiple services. The focus would be on seamless integration and creating a smooth, engaging user experience.

Possible names:
- TrackMe / TrackM3
- ReFlexion / Reflexon  - A reflection of your data
- Insightly – Gain insights about yourself

## Apps to integrate

### Gaming
- [Steam](https://steamcommunity.com/dev)
- [Chess.com](https://www.chess.com/news/view/published-data-api)
- [Lichess](https://lichess.org/api)
- [Runescape and OSRS](https://runescape.wiki/w/Application_programming_interface#The_RuneScape_Wiki)
- [Riot games (LOL and valorant)](https://developer.riotgames.com/apis)
- etc

### Social
- [Twitter](https://developer.x.com/en/docs/x-api)
- [Github](https://docs.github.com/en/rest)
- Instagram
- Whatsapp

### Fitness
- Check for apps and apis (missing)

### Music
- [Spotify](https://developer.spotify.com/documentation/web-api)

### Other apps
- Duolingo


# Getting Started

First, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Steam

Get an Api key from [Steam](https://steamcommunity.com/dev/apikey) and paste it as `STEAM_API_KEY = YourKeyHere` in the `.env` file.

### Spotify

To fetch a user's most played songs, add these values to your `.env` file:

```bash
SPOTIFY_CLIENT_ID=YourSpotifyClientId
SPOTIFY_CLIENT_SECRET=YourSpotifyClientSecret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

Create a Spotify app in the Spotify developer dashboard, set the callback URL to the same value as `SPOTIFY_REDIRECT_URI`, then connect from the app menu or dashboard.

Then call:

```bash
GET /api/spotify?limit=10&time_range=medium_term
```

Supported `time_range` values:
- `short_term`
- `medium_term`
- `long_term`