export type SpotifyTokenResponse = {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
};

export type SpotifyImage = {
    url: string;
    height: number | null;
    width: number | null;
};

export type SpotifyTopArtists = {
    id: string;
    name: string;
    popularity: number;
    images: SpotifyImage[];
    genres: string[];
    duration_ms: number;
    external_urls: { spotify: string };
    uri: string;
};

//type SpotifyArtist = {
//    id: string;
//    name: string;
//};

export type SpotifyArtist = {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    spotifyUrl: string;
    imageUrl: string | null;
};

export type SpotifyTrack = {
    id: string;
    name: string;
    artists: string[];
    album: string;
    releaseDate: string;
    durationMs: number;
    popularity: number;
    spotifyUrl: string;
    imageUrl: string | null;
};

export type SpotifyTopTrack = {
    id: string;
    name: string;
    popularity: number;
    duration_ms: number;
    external_urls: { spotify: string };
    album: {
        id: string;
        name: string;
        release_date: string;
        images: SpotifyImage[];
    };
    artists: SpotifyArtist[];
};