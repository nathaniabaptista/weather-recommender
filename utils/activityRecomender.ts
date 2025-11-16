export function getActivityRecommendation(condition: string, location: string) {
  const cond = condition.toLowerCase();

  if (cond.includes("rain")) {
    return `It's rainy! A great day to visit the lively ${location}'s waterfalls 🌧️💧`;
  }

  if (cond.includes("sunny")) {
    return `Perfect sunny weather — ideal for a beach trip in ${location}! ☀️🏖️`;
  }

  if (cond.includes("cloud")) {
    return `Cloudy skies today. Enjoy a relaxing café visit in ${location} ☕`;
  }

  return `Weather looks good! Explore nearby attractions in ${location}.`;
}
