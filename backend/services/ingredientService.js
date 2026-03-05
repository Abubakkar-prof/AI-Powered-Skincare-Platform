class IngredientService {
  constructor() {
    // Ingredient database with properties
    this.ingredients = {
      'niacinamide': {
        name: 'Niacinamide',
        aliases: ['Vitamin B3', 'Nicotinamide'],
        function: 'Brightens skin, reduces pore appearance, controls oil',
        benefits: ['Reduces hyperpigmentation', 'Minimizes pores', 'Controls sebum production', 'Anti-inflammatory'],
        skinTypes: ['all', 'oily', 'combination', 'sensitive'],
        concerns: ['acne', 'aging', 'texture'],
        concentration: '2-5%',
        compatibility: {
          positive: ['hyaluronic_acid', 'zinc', 'peptides'],
          negative: ['vitamin_c_acidic', 'pca_copper'],
          neutral: ['ceramides', 'squalane', 'glycerin']
        }
      },
      'retinol': {
        name: 'Retinol',
        aliases: ['Vitamin A', 'Retinoids'],
        function: 'Promotes cell turnover, reduces fine lines, treats acne',
        benefits: ['Reduces wrinkles', 'Improves skin texture', 'Treats acne', 'Boosts collagen'],
        skinTypes: ['normal', 'oily', 'combination', 'aging'],
        concerns: ['aging', 'acne', 'texture'],
        concentration: '0.1-1%',
        compatibility: {
          positive: ['hyaluronic_acid', 'ceramides', 'niacinamide'],
          negative: ['benzoyl_peroxide', 'ahas', 'bhAs', 'vitamin_c_acidic'],
          neutral: ['squalane', 'peptides', 'glycerin']
        }
      },
      'hyaluronic_acid': {
        name: 'Hyaluronic Acid',
        aliases: ['HA', 'Sodium Hyaluronate'],
        function: 'Intensely hydrates skin by holding up to 1000x its weight in water',
        benefits: ['Deep hydration', 'Plumps skin', 'Reduces fine lines', 'Suitable for all skin types'],
        skinTypes: ['all', 'dry', 'combination', 'sensitive'],
        concerns: ['dehydration', 'texture'],
        concentration: '0.1-2%',
        compatibility: {
          positive: ['niacinamide', 'ceramides', 'squalane', 'glycerin'],
          negative: [],
          neutral: ['retinol', 'vitamin_c', 'ahAs', 'salicylic_acid']
        }
      },
      'salicylic_acid': {
        name: 'Salicylic Acid',
        aliases: ['BHA', 'Beta Hydroxy Acid'],
        function: 'Exfoliates inside pores, treats acne and blackheads',
        benefits: ['Unclogs pores', 'Treats acne', 'Reduces blackheads', 'Oil-soluble exfoliant'],
        skinTypes: ['oily', 'acne-prone', 'combination'],
        concerns: ['acne', 'texture', 'blackheads'],
        concentration: '0.5-2%',
        compatibility: {
          positive: ['niacinamide', 'sulfur'],
          negative: ['retinol', 'vitamin_c_acidic', 'other_acids'],
          neutral: ['hyaluronic_acid', 'ceramides', 'squalane']
        }
      },
      'vitamin_c': {
        name: 'Vitamin C',
        aliases: ['L-Ascorbic Acid', 'Ascorbyl Glucoside', 'Magnesium Ascorbyl Phosphate'],
        function: 'Antioxidant that brightens skin and boosts collagen',
        benefits: ['Brightens skin', 'Antioxidant protection', 'Boosts collagen', 'Fades dark spots'],
        skinTypes: ['all', 'normal', 'combination', 'aging'],
        concerns: ['aging', 'dark_spots', 'texture'],
        concentration: '5-20%',
        compatibility: {
          positive: ['vitamin_e', 'ferulic_acid', 'hyaluronic_acid'],
          negative: ['benzoyl_peroxide', 'niacinamide', 'salicylic_acid'],
          neutral: ['retinol', 'peptides', 'ceramides']
        }
      },
      'glycolic_acid': {
        name: 'Glycolic Acid',
        aliases: ['AHA', 'Alpha Hydroxy Acid'],
        function: 'Exfoliates surface of skin, improves texture and tone',
        benefits: ['Exfoliates dead skin', 'Improves texture', 'Brightens skin', 'Boosts collagen'],
        skinTypes: ['normal', 'dull', 'aging', 'thick'],
        concerns: ['aging', 'texture', 'dark_spots'],
        concentration: '5-10%',
        compatibility: {
          positive: ['hyaluronic_acid', 'niacinamide'],
          negative: ['retinol', 'vitamin_c_acidic', 'salicylic_acid'],
          neutral: ['ceramides', 'squalane', 'peptides']
        }
      },
      'ceramides': {
        name: 'Ceramides',
        aliases: ['Ceramide NP', 'Ceramide AP', 'Ceramide EOP'],
        function: 'Restores skin barrier and locks in moisture',
        benefits: ['Strengthens skin barrier', 'Locks in moisture', 'Soothes skin', 'Reduces irritation'],
        skinTypes: ['all', 'dry', 'sensitive', 'compromised'],
        concerns: ['dehydration', 'sensitivity', 'barrier_function'],
        concentration: '0.2-2%',
        compatibility: {
          positive: ['hyaluronic_acid', 'niacinamide', 'squalane'],
          negative: [],
          neutral: ['retinol', 'acids', 'vitamin_c']
        }
      },
      'lactic_acid': {
        name: 'Lactic Acid',
        aliases: ['AHA', 'Alpha Hydroxy Acid'],
        function: 'Gentler exfoliant that also hydrates skin',
        benefits: ['Gentle exfoliation', 'Hydrates while exfoliating', 'Brightens skin', 'Improves texture'],
        skinTypes: ['all', 'sensitive', 'dry', 'normal'],
        concerns: ['texture', 'dark_spots', 'dullness'],
        concentration: '5-10%',
        compatibility: {
          positive: ['hyaluronic_acid', 'niacinamide'],
          negative: ['retinol', 'vitamin_c_acidic'],
          neutral: ['ceramides', 'squalane', 'peptides']
        }
      },
      'bha': {
        name: 'BHA (Beta Hydroxy Acid)',
        aliases: ['Salicylic Acid', 'Willow Bark Extract'],
        function: 'Oil-soluble exfoliant that penetrates pores',
        benefits: ['Deep pore cleansing', 'Treats acne', 'Reduces blackheads', 'Anti-inflammatory'],
        skinTypes: ['oily', 'acne-prone', 'combination'],
        concerns: ['acne', 'blackheads', 'clogged_pores'],
        concentration: '0.5-2%',
        compatibility: {
          positive: ['niacinamide', 'sulfur'],
          negative: ['retinol', 'vitamin_c_acidic', 'other_acids'],
          neutral: ['hyaluronic_acid', 'ceramides', 'squalane']
        }
      },
      'peptides': {
        name: 'Peptides',
        aliases: ['Palmitoyl Tripeptide', 'Matrixyl', 'Copper Peptides'],
        function: 'Stimulates collagen production and skin repair',
        benefits: ['Boosts collagen', 'Reduces wrinkles', 'Improves skin firmness', 'Anti-aging'],
        skinTypes: ['aging', 'normal', 'combination'],
        concerns: ['aging', 'loss_of_firmness', 'wrinkles'],
        concentration: '1-5%',
        compatibility: {
          positive: ['niacinamide', 'hyaluronic_acid', 'ceramides'],
          negative: [],
          neutral: ['retinol', 'vitamin_c', 'acids']
        }
      }
    };

    // Common ingredient conflicts
    this.conflicts = [
      {
        ingredients: ['retinol', 'benzoyl_peroxide'],
        risk: 'High',
        description: 'Benzoyl peroxide can deactivate retinol and increase irritation',
        alternative: 'Use retinol at night and benzoyl peroxide in the morning'
      },
      {
        ingredients: ['retinol', 'ahAs'],
        risk: 'High',
        description: 'Combining these can cause excessive irritation and sensitivity',
        alternative: 'Use on alternate nights or with a lower concentration'
      },
      {
        ingredients: ['retinol', 'bhAs'],
        risk: 'High',
        description: 'Combining these can cause excessive irritation and sensitivity',
        alternative: 'Use on alternate nights or with a lower concentration'
      },
      {
        ingredients: ['vitamin_c', 'niacinamide'],
        risk: 'Medium',
        description: 'May form a compound that reduces effectiveness of both ingredients',
        alternative: 'Use separately or choose stabilized forms'
      },
      {
        ingredients: ['vitamin_c', 'benzoyl_peroxide'],
        risk: 'High',
        description: 'Benzoyl peroxide can oxidize vitamin C, making it ineffective',
        alternative: 'Use vitamin C in the morning and benzoyl peroxide at night'
      },
      {
        ingredients: ['ahAs', 'bhAs'],
        risk: 'Medium',
        description: 'Using multiple acids can cause irritation and barrier damage',
        alternative: 'Use one acid at a time or in lower concentrations'
      },
      {
        ingredients: ['salicylic_acid', 'glycolic_acid'],
        risk: 'Medium',
        description: 'Combining these acids can cause irritation and over-exfoliation',
        alternative: 'Use on alternate days or choose one based on skin needs'
      }
    ];
  }

  // Get all ingredients
  getAllIngredients() {
    return Object.values(this.ingredients);
  }

  // Search for an ingredient by name
  findIngredient(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    // First, try exact match by name
    for (const [key, ingredient] of Object.entries(this.ingredients)) {
      if (ingredient.name.toLowerCase() === term) {
        return { ...ingredient, id: key };
      }
    }
    
    // Then, try aliases
    for (const [key, ingredient] of Object.entries(this.ingredients)) {
      if (ingredient.aliases.some(alias => alias.toLowerCase().includes(term))) {
        return { ...ingredient, id: key };
      }
    }
    
    // Partial match in name
    for (const [key, ingredient] of Object.entries(this.ingredients)) {
      if (ingredient.name.toLowerCase().includes(term)) {
        return { ...ingredient, id: key };
      }
    }
    
    return null;
  }

  // Get ingredient by ID
  getIngredientById(id) {
    const ingredient = this.ingredients[id.toLowerCase()];
    if (ingredient) {
      return { ...ingredient, id: id.toLowerCase() };
    }
    return null;
  }

  // Check for conflicts between ingredients
  checkConflicts(ingredientList) {
    const conflicts = [];
    const ingredientIds = ingredientList.map(ing => ing.toLowerCase());

    // Check each conflict in the database
    for (const conflict of this.conflicts) {
      // Check if all ingredients in the conflict are present in the list
      const allPresent = conflict.ingredients.every(conflictIng => 
        ingredientIds.includes(conflictIng.toLowerCase())
      );
      
      if (allPresent) {
        conflicts.push(conflict);
      }
    }

    // Also check compatibility data from individual ingredients
    for (const ingredientId of ingredientIds) {
      const ingredient = this.getIngredientById(ingredientId);
      if (ingredient) {
        // Check for negative compatibilities with other ingredients in the list
        for (const negativeIng of ingredient.compatibility.negative) {
          if (ingredientIds.includes(negativeIng.toLowerCase()) && 
              ingredientId.toLowerCase() !== negativeIng.toLowerCase()) {
            conflicts.push({
              ingredients: [ingredientId, negativeIng],
              risk: 'High',
              description: `${ingredient.name} and ${this.getIngredientById(negativeIng)?.name} may cause irritation or reduce effectiveness when used together`,
              alternative: `Use these ingredients at different times of the day or on alternate days`
            });
          }
        }
      }
    }

    // Remove duplicates
    const uniqueConflicts = [];
    const seen = new Set();
    
    for (const conflict of conflicts) {
      const conflictKey = [...conflict.ingredients].sort().join('-');
      if (!seen.has(conflictKey)) {
        seen.add(conflictKey);
        uniqueConflicts.push(conflict);
      }
    }

    return uniqueConflicts;
  }

  // Get ingredient benefits and properties
  getIngredientDetails(ingredientId) {
    const ingredient = this.getIngredientById(ingredientId);
    if (!ingredient) {
      return null;
    }

    return {
      ...ingredient,
      id: ingredientId,
      relatedIngredients: this.getRelatedIngredients(ingredientId)
    };
  }

  // Get related ingredients based on function or skin concerns
  getRelatedIngredients(ingredientId) {
    const targetIngredient = this.getIngredientById(ingredientId);
    if (!targetIngredient) {
      return [];
    }

    const related = [];
    
    for (const [id, ingredient] of Object.entries(this.ingredients)) {
      if (id === ingredientId) continue;
      
      // Check if they share similar functions, skin types, or concerns
      if (this.arraysIntersect(targetIngredient.benefits, ingredient.benefits) ||
          this.arraysIntersect(targetIngredient.skinTypes, ingredient.skinTypes) ||
          this.arraysIntersect(targetIngredient.concerns, ingredient.concerns)) {
        related.push({ ...ingredient, id });
      }
    }
    
    return related.slice(0, 5); // Return top 5 related ingredients
  }

  // Helper function to check if two arrays have any common elements
  arraysIntersect(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    return arr1.some(item => arr2.includes(item));
  }

  // Get ingredients suitable for specific skin concerns
  getIngredientsForConcerns(concerns) {
    const matchingIngredients = [];
    
    for (const [id, ingredient] of Object.entries(this.ingredients)) {
      if (ingredient.concerns.some(concern => concerns.includes(concern))) {
        matchingIngredients.push({ ...ingredient, id });
      }
    }
    
    return matchingIngredients;
  }

  // Get ingredients suitable for specific skin type
  getIngredientsForSkinType(skinType) {
    const matchingIngredients = [];
    
    for (const [id, ingredient] of Object.entries(this.ingredients)) {
      if (ingredient.skinTypes.includes('all') || ingredient.skinTypes.includes(skinType)) {
        matchingIngredients.push({ ...ingredient, id });
      }
    }
    
    return matchingIngredients;
  }
}

module.exports = new IngredientService();