type SpotifyTokenResponse = {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
};

type SpotifyImage = {
    url: string;
    height: number | null;
    width: number | null;
};

type SpotifyTopArtists = {
    id: string;
    name: string;
    popularity: number;
    images: SpotifyImage[];
    genres: string[];
    duration_ms: number;
    external_urls: { spotify: string };
    uri: string;
};

type SpotifyArtist = {
    id: string;
    name: string;
};

type SpotifyTopTrack = {
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