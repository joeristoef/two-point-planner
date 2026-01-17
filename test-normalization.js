const normalize = (name) => {
  return (
    name
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/\s+/g, '-')
      .replace(/!/g, '')
      + '.webp'
  );
};

console.log('Rally Cry ->', normalize('Rally Cry'));
console.log('Best Quest\'n ->', normalize('Best Quest\'n'));
console.log('Boom! ->', normalize('Boom!'));
console.log('Hero\'s Hand ->', normalize('Hero\'s Hand'));
