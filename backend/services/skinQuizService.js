class SkinQuizService {
  // Define the skin quiz questions
  getQuizQuestions() {
    return [
      {
        id: 1,
        question: "What is your age range?",
        type: "single",
        options: [
          { value: "18-25", label: "18-25", weight: { aging: 0, texture: 0 } },
          { value: "26-35", label: "26-35", weight: { aging: 1, texture: 1 } },
          { value: "36-45", label: "36-45", weight: { aging: 2, texture: 2 } },
          { value: "46+", label: "46+", weight: { aging: 3, texture: 3 } }
        ]
      },
      {
        id: 2,
        question: "What is your skin type?",
        type: "single",
        options: [
          { value: "oily", label: "Oily", weight: { oiliness: 3, hydration: -1 } },
          { value: "dry", label: "Dry", weight: { oiliness: -2, hydration: -2 } },
          { value: "combination", label: "Combination", weight: { oiliness: 1, hydration: 0 } },
          { value: "normal", label: "Normal", weight: { oiliness: 0, hydration: 0 } },
          { value: "sensitive", label: "Sensitive", weight: { sensitivity: 3 } }
        ]
      },
      {
        id: 3,
        question: "What are your main skin concerns?",
        type: "multiple",
        options: [
          { value: "acne", label: "Acne/Breakouts", weight: { acne: 3 } },
          { value: "aging", label: "Fine lines/Wrinkles", weight: { aging: 3, texture: 2 } },
          { value: "dark_spots", label: "Dark spots/Hyperpigmentation", weight: { dark_spots: 3 } },
          { value: "dehydration", label: "Dehydration", weight: { hydration: -3 } },
          { value: "texture", label: "Rough texture", weight: { texture: 3 } },
          { value: "sensitivity", label: "Sensitivity/Irritation", weight: { sensitivity: 3 } }
        ]
      },
      {
        id: 4,
        question: "What environment do you live in?",
        type: "single",
        options: [
          { value: "urban", label: "Urban/City", weight: { pollution: 2, acne: 1 } },
          { value: "suburban", label: "Suburban", weight: { pollution: 1 } },
          { value: "rural", label: "Rural", weight: { pollution: 0 } }
        ]
      },
      {
        id: 5,
        question: "How often are you exposed to the sun?",
        type: "single",
        options: [
          { value: "minimal", label: "Minimal (indoor work)", weight: { dark_spots: 0, aging: 0 } },
          { value: "moderate", label: "Moderate (some outdoor)", weight: { dark_spots: 1, aging: 1 } },
          { value: "high", label: "High (outdoor work/activities)", weight: { dark_spots: 3, aging: 3 } }
        ]
      }
    ];
  }

  // Calculate skin profile based on quiz answers
  calculateSkinProfile(answers) {
    // Initialize scores
    const scores = {
      hydration: 50,
      oiliness: 50,
      dark_spots: 10,
      texture: 50,
      acne: 10,
      aging: 10,
      sensitivity: 10,
      pollution: 10
    };

    // Apply weights from answers
    answers.forEach(answer => {
      const question = this.getQuizQuestions().find(q => q.id === answer.questionId);
      if (!question) return;

      if (question.type === 'single') {
        // Single selection
        const option = question.options.find(opt => opt.value === answer.selectedValue);
        if (option && option.weight) {
          Object.keys(option.weight).forEach(key => {
            scores[key] = Math.max(0, Math.min(100, scores[key] + option.weight[key] * 10));
          });
        }
      } else if (question.type === 'multiple') {
        // Multiple selection
        answer.selectedValues.forEach(selectedValue => {
          const option = question.options.find(opt => opt.value === selectedValue);
          if (option && option.weight) {
            Object.keys(option.weight).forEach(key => {
              scores[key] = Math.max(0, Math.min(100, scores[key] + option.weight[key] * 10));
            });
          }
        });
      }
    });

    // Determine skin type based on scores
    const skinType = this.determineSkinType(scores);

    // Determine primary concerns
    const concerns = this.getPrimaryConcerns(scores);

    // Calculate skin score (higher is better)
    const skinScore = this.calculateSkinScore(scores);

    return {
      skinType,
      skinScore,
      skinConcerns: concerns,
      skinAnalysis: {
        hydration: scores.hydration,
        oiliness: scores.oiliness,
        darkSpots: scores.dark_spots,
        texture: scores.texture
      }
    };
  }

  // Determine skin type based on scores
  determineSkinType(scores) {
    if (scores.oiliness > 70) return 'oily';
    if (scores.hydration < 30) return 'dry';
    if (scores.sensitivity > 60) return 'sensitive';
    if (scores.oiliness > 50 && scores.hydration < 50) return 'combination';
    return 'normal';
  }

  // Get primary concerns based on scores
  getPrimaryConcerns(scores) {
    const concerns = [];
    
    if (scores.acne > 50) concerns.push('acne');
    if (scores.aging > 50) concerns.push('aging');
    if (scores.dark_spots > 50) concerns.push('dark_spots');
    if (scores.hydration < 40) concerns.push('dehydration');
    if (scores.sensitivity > 50) concerns.push('sensitivity');
    if (scores.texture > 60) concerns.push('texture');
    
    return concerns.length > 0 ? concerns : ['none'];
  }

  // Calculate overall skin score
  calculateSkinScore(scores) {
    // Calculate weighted average
    const total = 
      (100 - scores.acne) * 0.2 + 
      (100 - scores.aging) * 0.2 + 
      (100 - scores.dark_spots) * 0.2 + 
      scores.hydration * 0.15 + 
      scores.texture * 0.15 + 
      (100 - scores.sensitivity) * 0.1;
    
    return Math.round(total);
  }

  // Generate personalized recommendations based on skin profile
  generateRecommendations(skinProfile) {
    const recommendations = [];
    
    // Add recommendations based on skin type
    switch (skinProfile.skinType) {
      case 'oily':
        recommendations.push({
          category: 'cleanser',
          product: 'Gentle Foaming Cleanser',
          reason: 'Helps control excess oil without over-drying'
        });
        break;
      case 'dry':
        recommendations.push({
          category: 'cleanser',
          product: 'Cream Cleanser',
          reason: 'Provides hydration while cleansing'
        });
        break;
      case 'sensitive':
        recommendations.push({
          category: 'cleanser',
          product: 'Fragrance-Free Gentle Cleanser',
          reason: 'Minimizes irritation for sensitive skin'
        });
        break;
      default:
        recommendations.push({
          category: 'cleanser',
          product: 'Balanced Cleanser',
          reason: 'Maintains natural skin balance'
        });
    }
    
    // Add recommendations based on concerns
    if (skinProfile.skinConcerns.includes('acne')) {
      recommendations.push({
        category: 'treatment',
        product: 'Salicylic Acid Treatment',
        reason: 'Helps unclog pores and reduce breakouts'
      });
    }
    
    if (skinProfile.skinConcerns.includes('aging')) {
      recommendations.push({
        category: 'serum',
        product: 'Retinol Serum',
        reason: 'Promotes cell turnover and reduces fine lines'
      });
    }
    
    if (skinProfile.skinConcerns.includes('dark_spots')) {
      recommendations.push({
        category: 'serum',
        product: 'Vitamin C Serum',
        reason: 'Brightens skin and fades hyperpigmentation'
      });
    }
    
    if (skinProfile.skinConcerns.includes('dehydration')) {
      recommendations.push({
        category: 'moisturizer',
        product: 'Hyaluronic Acid Moisturizer',
        reason: 'Attracts and retains moisture in the skin'
      });
    }
    
    return recommendations;
  }
}

module.exports = new SkinQuizService();