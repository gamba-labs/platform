export const calculateBetArray = (multiplier: number) => {
  // Extract the fractional part and handle precision issues by rounding
  const fraction = Math.round((multiplier % 1) * 100) / 100

  // Determine the number of repetitions based on the fractional part
  const repeatMultiplier = (
    () => {
      switch (fraction) {
        case 0.25:
          return 4
        case 0.5:
          return 2
        case 0.75:
          return 4 // Needs 4 repetitions to sum to a whole number
        default:
          return 1 // Whole numbers and zero fraction
      }
    }
  )()

  // Calculate the total sum when the multiplier is used 'repeatMultiplier' times
  const totalSum = multiplier * repeatMultiplier

  // Create the array with the multiplier repeated 'repeatMultiplier' times
  const betArray = Array.from({ length: repeatMultiplier }).map(() => multiplier)

  // Calculate the total number of elements needed (rounded up to ensure whole number)
  const totalElements = Math.ceil(totalSum)

  // Add zeros to make the array length equal to 'totalElements'
  const zerosToAdd = totalElements - repeatMultiplier

  return betArray.concat(Array.from({ length: zerosToAdd }).map(() => 0))
}


