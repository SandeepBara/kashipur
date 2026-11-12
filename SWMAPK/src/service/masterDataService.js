import axios from 'axios';
import { swmMasterDataApi,sub_category_api ,review_tax_api} from '../api/endpoints';
import { getToken } from '../util/auth';
// import {  } from '../api/endpoints';

console.log('swmMasterDataApi =>', swmMasterDataApi );
console.log('sub_category_api =>', sub_category_api);
console.log('review_tax_api =>', review_tax_api);
export const fetchMasterData = async () => {
  try {
    const token = await getToken();
    console.log("token", token);

    const response = await axios.post(
      swmMasterDataApi,
      {}, // body (empty)
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // return only the data
  } catch (error) {
    console.log('❌ Master Data Fetch Error:', error);
    throw error;
  }
};

// Fetch sub-category based on selected category
export const fetchSubCategory = async (categoryId) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      sub_category_api,
      { categoryTypeMasterId:categoryId }, // send selected categoryId in body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
console.log("categoery id",categoryId)
    return response.data; // sub-category list
  } catch (error) {
    console.log('❌ Sub-Category Fetch Error:', error);
    throw error;
  }
};

export const fetchTaxData = async (categoryId, subCategoryId,hasCompostingMachineProvision) => {
  console.log("fetch tax data called with",categoryId, subCategoryId,hasCompostingMachineProvision);
  try {
    const token = await getToken();

    const response = await axios.post(
      review_tax_api,
      {
        categoryTypeMasterId:categoryId,
        subCategoryTypeMasterId: subCategoryId,
        hasCompostingMachineProvision:hasCompostingMachineProvision,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("tax data response",response.data);

    return response.data; // contains tax info based on category + subcategory
  } catch (error) {
    console.error('❌ Fetch Tax Data Error:', error);
    return null;
  }
};
