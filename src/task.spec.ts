import test from 'ava';

import { CORRECT } from './correctResult';
import { Category, getCategories } from './mockedApi';
import {
  CategoryListElement,
  categoryTree,
  getCategoryOrder,
  getShowOnHomeIds,
  mapCategoryToListElement,
  setShowOnHomeFlag,
} from './task';

test('getCategoryOrder should correctly parse number title', (t) => {
  const category = {
    Title: '123',
  } as Category;

  t.is(getCategoryOrder(category), 123);
});

test('getCategoryOrder should return id when title is not a number', (t) => {
  const category = {
    Title: 'ayaya',
    id: 8,
  } as Category;

  t.is(getCategoryOrder(category), 8);
});

test('mapCategoryToListElement should correctly parse category', async (t) => {
  const category: Category = {
    id: 9293,
    name: 'Płyny i żele',
    hasChildren: false,
    url: 'https://exampledataprovider.com/porządki/pranie-i-prasowanie/płyny-i-żele',
    children: [],
    Title: 'Płyny i żele',
    MetaTagDescription: 'Płyny i żele',
  };

  const listElement = mapCategoryToListElement(category);

  t.is(listElement.id, category.id);
  t.is(listElement.image, category.MetaTagDescription);
  t.is(listElement.name, category.name);
  t.is(listElement.showOnHome, false);
  t.truthy(listElement.children);
  t.truthy(listElement.order);
});

test('getShowOnHomeIds should correctly return showOnHome categories', (t) => {
  const categories = [
    { Title: '1', id: 1 },
    { Title: '2#', id: 2 },
    { Title: '3#', id: 3 },
    { Title: '4', id: 4 },
  ] as Category[];

  t.deepEqual(getShowOnHomeIds(categories), [2, 3]);
});

test("setShowOnHomeFlag should correctly set flag to all list elements when there's less than 5", (t) => {
  const categoryListElements = [
    { showOnHome: false },
    { showOnHome: false },
  ] as CategoryListElement[];

  t.deepEqual(setShowOnHomeFlag(categoryListElements, []), [
    { showOnHome: true },
    { showOnHome: true },
  ] as CategoryListElement[]);

  t.deepEqual(setShowOnHomeFlag(categoryListElements, [1, 3, 5, 8]), [
    { showOnHome: true },
    { showOnHome: true },
  ] as CategoryListElement[]);
});

test("setShowOnHomeFlag should correctly set flag to first 3 list elements when there's more than 5 and no showOnHome ids", (t) => {
  const categoryListElements = Array.from({ length: 10 }, () => ({
    showOnHome: false,
  })) as CategoryListElement[];

  const result = setShowOnHomeFlag(categoryListElements, []);

  for (const [idx, resultElement] of result.entries()) {
    t.is(resultElement.showOnHome, idx < 3 ? true : false);
  }
});

test('setShowOnHomeFlag should correctly set flag to selected elements', (t) => {
  const categoryListElements = Array.from({ length: 10 }, (_, idx) => ({
    showOnHome: false,
    id: idx,
  })) as CategoryListElement[];

  const showOnHomeIds = [1, 3, 5, 8];

  const result = setShowOnHomeFlag(categoryListElements, showOnHomeIds);

  for (const resultElement of result) {
    t.is(
      resultElement.showOnHome,
      showOnHomeIds.includes(resultElement.id) ? true : false
    );
  }
});

test('categoryTree should return empty output when empty input provided', async (t) => {
  const result = await categoryTree({
    getCategories: () => new Promise((resolve) => resolve({ data: [] })),
  });

  t.deepEqual(result, []);
});

test('categoryTree should return correct output', async (t) => {
  const result = await categoryTree({ getCategories });

  t.deepEqual(result, CORRECT);
});
