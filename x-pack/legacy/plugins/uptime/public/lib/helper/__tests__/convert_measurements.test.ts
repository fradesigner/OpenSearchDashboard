/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { convertMicrosecondsToMilliseconds } from '../convert_measurements';

describe('convertMicrosecondsToMilliseconds', () => {
  it('converts microseconds to millis', () => {
    const microValue = 3425342;
    const result = convertMicrosecondsToMilliseconds(microValue);
    expect(result).toEqual(3425);
  });
  it('returns 0 for null parameter', () => {
    expect(convertMicrosecondsToMilliseconds(null)).toBe(0);
  });
  it('returns 0 for undefined parameter', () => {
    expect(convertMicrosecondsToMilliseconds(undefined)).toBe(0);
  });
  it('properly converts us to ms', () => {
    expect(convertMicrosecondsToMilliseconds(2300000)).toBe(2300);
  });
});
