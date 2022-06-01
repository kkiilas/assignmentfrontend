const getText = async (file) => {
  const response = await file.text()
  return response
}

export default { getText }
