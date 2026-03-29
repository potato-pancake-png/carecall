'use strict';

const {
  AppError,
  NotFoundError,
  ValidationError,
  ExternalServiceError,
  DatabaseError,
} = require('../errors/AppError');

describe('AppError 커스텀 에러 클래스', () => {
  test('AppError는 statusCode와 message를 가진다', () => {
    const err = new AppError('테스트 에러', 503);
    expect(err.message).toBe('테스트 에러');
    expect(err.statusCode).toBe(503);
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });

  test('NotFoundError는 statusCode 404를 가진다', () => {
    const err = new NotFoundError('찾을 수 없음');
    expect(err.statusCode).toBe(404);
    expect(err instanceof AppError).toBe(true);
  });

  test('ValidationError는 statusCode 400을 가진다', () => {
    const err = new ValidationError('유효하지 않음');
    expect(err.statusCode).toBe(400);
  });

  test('ExternalServiceError는 statusCode 502를 가진다', () => {
    const err = new ExternalServiceError('외부 서비스 오류');
    expect(err.statusCode).toBe(502);
  });

  test('DatabaseError는 statusCode 500을 가진다', () => {
    const err = new DatabaseError('DB 오류');
    expect(err.statusCode).toBe(500);
  });

  test('메시지 없이 생성 시 기본 메시지가 설정된다', () => {
    expect(new NotFoundError().message).toBe('Resource not found');
    expect(new ValidationError().message).toBe('Validation failed');
    expect(new ExternalServiceError().message).toBe('External service error');
    expect(new DatabaseError().message).toBe('Database error');
  });
});
