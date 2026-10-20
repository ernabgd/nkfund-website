DEMO Facebook posts for designing the "Latest from Facebook" cards on the LOCAL dev server only
(`FB_DEMO=true npm start`). `npm run build` and CI never read this folder; production shows only real
imported posts from content/facebook/ or, when there are none, the "Follow us" card.
