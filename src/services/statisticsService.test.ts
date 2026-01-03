import { describe, it, expect, beforeEach } from 'vitest';
import { aggregateData, aggregateRatings } from './statisticsService';
import { addMeal, addShoppingEvent } from './dataService';

describe('statisticsService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    localStorage.removeItem('food-inventory-data');
  });

  describe('aggregateData', () => {
    it('should aggregate meals by day', () => {
      addMeal({
        name: 'Lunch',
        date: new Date('2024-01-15T12:00:00'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });

      addMeal({
        name: 'Dinner',
        date: new Date('2024-01-15T18:00:00'),
        items: [],
        totalCost: 15,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });

      const result = aggregateData(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day',
        'meals'
      );

      expect(result).toHaveLength(1);
      expect(result[0].cost).toBe(25);
      expect(result[0].items).toHaveLength(2);
    });

    it('should aggregate shopping events by week', () => {
      addShoppingEvent({
        date: new Date('2024-01-15'),
        items: [],
        totalCost: 100,
      });

      addShoppingEvent({
        date: new Date('2024-01-17'),
        items: [],
        totalCost: 50,
      });

      const result = aggregateData(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'week',
        'shopping'
      );

      expect(result).toHaveLength(1);
      expect(result[0].cost).toBe(150);
    });
  });

  describe('aggregateRatings', () => {
    it('should aggregate ratings by day', () => {
      addMeal({
        name: 'Lunch',
        date: new Date('2024-01-15T12:00:00'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 4,
      });

      addMeal({
        name: 'Dinner',
        date: new Date('2024-01-15T18:00:00'),
        items: [],
        totalCost: 15,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 5,
      });

      const result = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day'
      );

      expect(result).toHaveLength(1);
      expect(result[0].averageRating).toBe(4.5);
      expect(result[0].ratingCount).toBe(2);
      expect(result[0].meals).toHaveLength(2);
    });

    it('should aggregate ratings by week', () => {
      addMeal({
        name: 'Monday Lunch',
        date: new Date('2024-01-15T12:00:00'), // Monday
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 3,
      });

      addMeal({
        name: 'Wednesday Dinner',
        date: new Date('2024-01-17T18:00:00'), // Wednesday
        items: [],
        totalCost: 15,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 5,
      });

      const result = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'week'
      );

      expect(result).toHaveLength(1);
      expect(result[0].averageRating).toBe(4);
      expect(result[0].ratingCount).toBe(2);
    });

    it('should only include meals with ratings', () => {
      addMeal({
        name: 'Rated Lunch',
        date: new Date('2024-01-15T12:00:00'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 4,
      });

      addMeal({
        name: 'Unrated Dinner',
        date: new Date('2024-01-15T18:00:00'),
        items: [],
        totalCost: 15,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        // No rating
      });

      const result = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day'
      );

      expect(result).toHaveLength(1);
      expect(result[0].ratingCount).toBe(1);
      expect(result[0].averageRating).toBe(4);
    });

    it('should return empty array when no rated meals exist', () => {
      addMeal({
        name: 'Unrated Meal',
        date: new Date('2024-01-15T12:00:00'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });

      const result = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day'
      );

      expect(result).toHaveLength(0);
    });

    it('should filter by date range', () => {
      addMeal({
        name: 'January Meal',
        date: new Date('2024-01-15'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 5,
      });

      addMeal({
        name: 'February Meal',
        date: new Date('2024-02-15'),
        items: [],
        totalCost: 15,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 3,
      });

      const januaryResult = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day'
      );

      expect(januaryResult).toHaveLength(1);
      expect(januaryResult[0].averageRating).toBe(5);
    });

    it('should sort results by date', () => {
      addMeal({
        name: 'Later Meal',
        date: new Date('2024-01-20'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 3,
      });

      addMeal({
        name: 'Earlier Meal',
        date: new Date('2024-01-10'),
        items: [],
        totalCost: 15,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 5,
      });

      const result = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day'
      );

      expect(result).toHaveLength(2);
      expect(new Date(result[0].date).getTime()).toBeLessThan(new Date(result[1].date).getTime());
    });

    it('should include meal details in results', () => {
      const meal = addMeal({
        name: 'Test Meal',
        date: new Date('2024-01-15'),
        items: [],
        totalCost: 10,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 4,
      });

      const result = aggregateRatings(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'day'
      );

      expect(result[0].meals[0].id).toBe(meal.id);
      expect(result[0].meals[0].name).toBe('Test Meal');
      expect(result[0].meals[0].rating).toBe(4);
    });
  });
});
