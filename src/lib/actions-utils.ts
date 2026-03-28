export type ActionResponse<T = any> = {
  data?: T;
  error?: string;
  success: boolean;
};

export function successResponse<T>(data: T): ActionResponse<T> {
  return {
    data,
    success: true,
  };
}

export function errorResponse(error: string): ActionResponse {
  return {
    error,
    success: false,
  };
}

/**
 * 包装 Server Action 执行过程，捕获错误并返回标准响应
 */
export async function createAction<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return successResponse(data);
  } catch (error: any) {
    console.error("Action Error:", error);
    return errorResponse(error.message || "发生未知错误");
  }
}
