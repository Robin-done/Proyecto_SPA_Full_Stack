export const pick = (source = {}, allowedFields = []) => {
  return Object.keys(source).reduce((filtered, key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = source[key];
    }
    return filtered;
  }, {});
};

export const hasAllowedFields = (source = {}, allowedFields = []) => {
  return Object.keys(source).some((key) => allowedFields.includes(key));
};
