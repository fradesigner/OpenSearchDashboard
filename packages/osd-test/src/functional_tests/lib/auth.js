/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import fs from 'fs';
import util from 'util';
import { format as formatUrl } from 'url';

import request from 'request';
import { delay } from 'bluebird';

export const DEFAULT_SUPERUSER_PASS = 'changeme';

const readFile = util.promisify(fs.readFile);

async function updateCredentials({
  port,
  auth,
  username,
  password,
  retries = 10,
  protocol,
  caCert,
}) {
  const result = await new Promise((resolve, reject) =>
    request(
      {
        method: 'PUT',
        uri: formatUrl({
          protocol: `${protocol}:`,
          auth,
          hostname: 'localhost',
          port,
          pathname: `/_security/user/${username}/_password`,
        }),
        json: true,
        body: { password },
        ca: caCert,
      },
      (err, httpResponse, body) => {
        if (err) return reject(err);
        resolve({ httpResponse, body });
      }
    )
  );

  const { body, httpResponse } = result;
  const { statusCode } = httpResponse;

  if (statusCode === 200) {
    return;
  }

  if (retries > 0) {
    await delay(2500);
    return await updateCredentials({
      port,
      auth,
      username,
      password,
      retries: retries - 1,
      protocol,
      caCert,
    });
  }

  throw new Error(`${statusCode} response, expected 200 -- ${JSON.stringify(body)}`);
}

export async function setupUsers({ log, opensearchPort, updates, protocol = 'http', caPath }) {
  // track the current credentials for the `opensearch` user as
  // they will likely change as we apply updates
  let auth = `opensearch:${DEFAULT_SUPERUSER_PASS}`;
  const caCert = caPath && (await readFile(caPath));

  for (const { username, password, roles } of updates) {
    // If working with a built-in user, just change the password
    if (['logstash_system', 'opensearch', 'opensearchDashboards'].includes(username)) {
      await updateCredentials({ port: opensearchPort, auth, username, password, protocol, caCert });
      log.info('setting %j user password to %j', username, password);

      // If not a builtin user, add them
    } else {
      await insertUser({ port: opensearchPort, auth, username, password, roles, protocol, caCert });
      log.info('Added %j user with password to %j', username, password);
    }

    if (username === 'opensearch') {
      auth = `opensearch:${password}`;
    }
  }
}

async function insertUser({
  port,
  auth,
  username,
  password,
  roles = [],
  retries = 10,
  protocol,
  caCert,
}) {
  const result = await new Promise((resolve, reject) =>
    request(
      {
        method: 'POST',
        uri: formatUrl({
          protocol: `${protocol}:`,
          auth,
          hostname: 'localhost',
          port,
          pathname: `/_security/user/${username}`,
        }),
        json: true,
        body: { password, roles },
        ca: caCert,
      },
      (err, httpResponse, body) => {
        if (err) return reject(err);
        resolve({ httpResponse, body });
      }
    )
  );

  const { body, httpResponse } = result;
  const { statusCode } = httpResponse;
  if (statusCode === 200) {
    return;
  }

  if (retries > 0) {
    await delay(2500);
    return await insertUser({
      port,
      auth,
      username,
      password,
      roles,
      retries: retries - 1,
      protocol,
      caCert,
    });
  }

  throw new Error(`${statusCode} response, expected 200 -- ${JSON.stringify(body)}`);
}
