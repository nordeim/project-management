// Day-image seam (v1.9, measured on the live app): the dashboard date-card
// photo rotates by time of day across four lighting variants of the same
// rolling-hills artwork. The live bundle's XF() maps:
//   05:00–10:59 → morning   11:00–16:59 → noon
//   17:00–20:59 → dusk      else (21:00–04:59) → night
// The assets are local copies of the reference's four images (converted to
// optimized JPEGs); dayImageFor returns the public path for a given date.

export function dayImageFor(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "/day-hills-morning.jpg";
  if (h >= 11 && h < 17) return "/day-hills-noon.jpg";
  if (h >= 17 && h < 21) return "/day-hills-dusk.jpg";
  return "/day-hills-night.jpg";
}
