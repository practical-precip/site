export const figureNotes: Record<
  string,
  { title: string; alt: string; caption: string }
> = {
  "annual-precipitation": {
    title: "The same annual total can hide a different season.",
    alt: "Two synthetic monthly precipitation series both total 960 mm, but one has winter peaks and the other is constant.",
    caption:
      "Both constructed examples total 960 mm in one year. The first has a winter maximum; the second has 80 mm each month. Annual agreement alone cannot establish seasonal agreement.",
  },
  "annual-maximum": {
    title: "A daily total does not identify an hourly peak.",
    alt: "Two synthetic 24-hour storms both total 48 mm. One is steady at 2 mm each hour; the other places all 48 mm in two hours with a peak of 30 mm.",
    caption:
      "The constructed storms have identical daily accumulations of 48 mm and different hourly maxima. Daily output alone cannot distinguish these within-day sequences.",
  },
  intermittency: {
    title: "Wet frequency does not identify spell length.",
    alt: "Two constructed 12-day rainfall sequences contain six wet days and 12 mm total. One alternates wet and dry days; the other groups six wet days together.",
    caption:
      "Both sequences have six wet days and 12 mm of precipitation. At a threshold of 1 mm/day, the longest dry spell within the displayed window is one day in the alternating sequence and six days in the clustered sequence.",
  },
  "precipitation-phase": {
    title: "The assumed transition changes the rain fraction.",
    alt: "Two illustrative sigmoid curves show different rain fractions at the same air temperature when the assumed transition midpoint shifts from 0 to 2 degrees Celsius.",
    caption:
      "These logistic curves are mathematical illustrations with chosen transition midpoints of 0 and 2 degrees Celsius and slope scale 0.8 degrees Celsius. They are not fitted phase models or recommended thresholds. See Jennings et al. below for observational evidence.",
  },
  "spatial-coherence": {
    title: "The same local values can produce a different basin peak.",
    alt: "Synthetic rainfall at two equal-area cells has the same distribution in each cell in both cases. Synchronized rain gives a basin maximum of 20 mm/day; staggered rain gives a maximum of 10 mm/day.",
    caption:
      "Each cell has the same set of daily values in both examples. Changing the relative timing changes the equal-area basin mean and its maximum. This is a constructed dependence example, not an evaluation of a named product.",
  },
};
