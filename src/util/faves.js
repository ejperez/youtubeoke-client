export const addToFavorites = (item) => {
  const currentFaves = JSON.parse(localStorage.getItem("faves") || "[]");
  const currentFaveIds = currentFaves.map((item) => item.id);

  if (currentFaveIds.includes(item.id)) {
    return resolve(currentFaves);
  }

  const newCurrentFaves = [...currentFaves, item];

  localStorage.setItem("faves", JSON.stringify(newCurrentFaves));

  return newCurrentFaves;
};

export const getFavorites = () => {
  const currentFaves = JSON.parse(localStorage.getItem("faves") || "[]");

  return currentFaves;
};

export const isInFavorites = (id) => {
  const currentFaves = JSON.parse(localStorage.getItem("faves") || "[]");
  const currentFaveIds = currentFaves.map((item) => item.id);

  return currentFaveIds.includes(id);
};

export const removeFromFavorites = (id) => {
  const currentFaves = JSON.parse(localStorage.getItem("faves") || "[]");
  const newCurrentFaves = currentFaves.filter((item) => item.id !== id);

  localStorage.setItem("faves", JSON.stringify(newCurrentFaves));

  return newCurrentFaves;
};
