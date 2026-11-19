# Adding a client video

The testimonial carousel in `components/sections/Testimonials.tsx` currently displays the two Google Drive recordings supplied by Hamid: Abdullah Abbasii (Nexus Growth) and Usman (Prestige Media). Both were verified as portrait 9:16, with playback durations of approximately 49 and 56 seconds.

## Google Drive recordings

Add the public Drive file ID to `data/testimonials.ts` with `provider: "google-drive"`, `aspectRatio: "9 / 16"`, and a verified `durationLabel`. Keep the file accessible to visitors with the link. The section uses the supplied `/preview` embeds; an Open video link provides direct access to Drive.

Only the selected video is mounted. Switching clients removes the previous player, stopping its playback. Next/previous buttons, the named client selectors, and keyboard arrows switch videos. On touch screens, swipe the counter area below the player; gestures inside the Google player remain available for its playback controls. Videos do not autoplay or rotate automatically. Embeds load lazily.

Google controls the embedded player's playback interface and captions. Captions or transcripts have not been supplied separately, so none are fabricated. Add accurate captions to the source recordings when available. Safari/iPhone still needs real-device playback verification.

Run `node scripts/qa-testimonials.mjs` to check portrait sizing, carousel controls, embedded playback and the portfolio's accessible labels. It accepts `QA_BASE_URL` for the production preview. Automated checks exclude Google's internal controls and test our iframe titles and fallback links separately.

The external Google player currently has an `aria-prohibited-attr` finding on its own loading/display status `div` (`aria-label` without a supporting role). That cross-origin markup cannot be changed by the portfolio. Full-page accessibility checks therefore exclude the iframe's internal document, while still checking the surrounding portfolio controls. This does not establish full accessibility compliance of the video content or Google's player.

## Direct video files

For each testimonial, supply the video, the client's name, their role/company, and permission to display it. A portrait or landscape video works. Short clips of roughly 20–60 seconds keep the section easy to browse; this is a recommendation, not a limit.

1. Put the approved video and its poster frame in `public/videos/testimonials/`. Use an MP4 with broadly supported H.264 video/AAC audio, or a WebM. Keep the original elsewhere.
2. Add a matching WebVTT captions file and an accurate transcript. Identify the caption language (for example `en` for English or `ur` for Urdu).
3. Add an entry to `data/testimonials.ts`:

```ts
{
  id: "client-project",
  name: "Client's real name",
  company: "Company name",
  role: "Client's role",
  // Optional: a short, approved quote from the actual recording.
  video: {
    src: "/videos/testimonials/client-project.mp4",
    poster: "/videos/testimonials/client-project.webp",
    captions: "/videos/testimonials/client-project.vtt",
    captionsLanguage: "en",
    captionsLabel: "English",
    transcript: "Accurate transcript of the recording.",
  },
}
```

Direct-file videos play only when the visitor chooses to play. This alternative uses native controls, stays inline on mobile, supports supplied captions and transcripts, and pauses when offscreen or the page is hidden. `preload="none"` keeps direct video files from downloading on initial page load.

The local static server supports byte ranges for seeking. After adding the real videos, verify playback, seeking, audio, captions, poster crops and mobile sizing on the production build. Safari/iPhone playback still needs a real-device check. Use a poster from the supplied recording; do not fabricate clients, quotes or identities.
