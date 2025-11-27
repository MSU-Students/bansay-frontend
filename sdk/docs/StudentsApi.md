# StudentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**studentControllerCreate**](#studentcontrollercreate) | **POST** /students | Create a student|
|[**studentControllerDeleteStudent**](#studentcontrollerdeletestudent) | **DELETE** /students/{id} | Delete a student|
|[**studentControllerFindAll**](#studentcontrollerfindall) | **GET** /students | Get all students|
|[**studentControllerPatchStudent**](#studentcontrollerpatchstudent) | **PATCH** /students/{id} | Update a student|

# **studentControllerCreate**
> studentControllerCreate(studentRegistrationDto)


### Example

```typescript
import {
    StudentsApi,
    Configuration,
    StudentRegistrationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new StudentsApi(configuration);

let studentRegistrationDto: StudentRegistrationDto; //

const { status, data } = await apiInstance.studentControllerCreate(
    studentRegistrationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentRegistrationDto** | **StudentRegistrationDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **studentControllerDeleteStudent**
> studentControllerDeleteStudent()


### Example

```typescript
import {
    StudentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudentsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.studentControllerDeleteStudent(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **studentControllerFindAll**
> Array<StudentDto> studentControllerFindAll()


### Example

```typescript
import {
    StudentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StudentsApi(configuration);

const { status, data } = await apiInstance.studentControllerFindAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<StudentDto>**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **studentControllerPatchStudent**
> studentControllerPatchStudent(studentPatchDto)


### Example

```typescript
import {
    StudentsApi,
    Configuration,
    StudentPatchDto
} from './api';

const configuration = new Configuration();
const apiInstance = new StudentsApi(configuration);

let id: string; // (default to undefined)
let studentPatchDto: StudentPatchDto; //

const { status, data } = await apiInstance.studentControllerPatchStudent(
    id,
    studentPatchDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentPatchDto** | **StudentPatchDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

