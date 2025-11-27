# OfficerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**officerControllerFindAll**](#officercontrollerfindall) | **GET** /officer | |

# **officerControllerFindAll**
> Array<OfficerDto> officerControllerFindAll()


### Example

```typescript
import {
    OfficerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OfficerApi(configuration);

const { status, data } = await apiInstance.officerControllerFindAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<OfficerDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

