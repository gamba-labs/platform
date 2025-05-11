export const calculateBetArray = (multiplier: number) => {
  const fraction = Math.round((multiplier % 1) * 100) / 100
  const repeatMultiplier = (() => {
    switch (fraction) {
      case 0.25:
        return 4
      case 0.5:
        return 2
      case 0.75:
        return 4
      default:
        return 1
    }
  })()
  const totalSum = multiplier * repeatMultiplier
  const betArray = Array.from({ length: repeatMultiplier }).map(() => multiplier)
  const totalElements = Math.ceil(totalSum)
  const zerosToAdd = totalElements - repeatMultiplier
  return betArray.concat(Array.from({ length: zerosToAdd }).map(() => 0))
}
