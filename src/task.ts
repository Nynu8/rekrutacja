import { Category } from './mockedApi';

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

interface CategoryTreeDependencies {
  getCategories: () => Promise<{ data: Category[] }>;
}

export const getCategoryOrder = (category: Category): number => {
  const title = parseInt(category.Title);
  return isNaN(title) ? category.id : title;
};

export const mapCategoryToListElement = (
  category: Category
): CategoryListElement => ({
  id: category.id,
  image: category.MetaTagDescription,
  name: category.name,
  order: getCategoryOrder(category),
  children: mapCategoriesToSortedListElements(category.children),
  showOnHome: false,
});

const mapCategoriesToSortedListElements = (
  categories: Category[]
): CategoryListElement[] =>
  categories
    .map((category) => mapCategoryToListElement(category))
    .sort((catA, catB) => catA.order - catB.order);

export const getShowOnHomeIds = (categories: Category[]): number[] =>
  categories
    .filter((category) => category.Title.includes('#'))
    .map((category) => category.id);

export const setShowOnHomeFlag = (
  categories: CategoryListElement[],
  showOnHomeIds: number[]
) => {
  if (categories.length < 5) {
    return categories.map((category) => ({
      ...category,
      showOnHome: true,
    }));
  }

  if (showOnHomeIds.length > 0) {
    return categories.map((category) =>
      showOnHomeIds.includes(category.id)
        ? {
            ...category,
            showOnHome: true,
          }
        : category
    );
  }

  return categories.map((category, idx) => ({
    ...category,
    showOnHome: idx < 3,
  }));
};

export const categoryTree = async (
  dependencies: CategoryTreeDependencies
): Promise<CategoryListElement[]> => {
  const { data } = await dependencies.getCategories();

  if (!data) {
    return [];
  }

  const result = mapCategoriesToSortedListElements(data);
  const showOnHomeIds = getShowOnHomeIds(data);

  return setShowOnHomeFlag(result, showOnHomeIds);
};
