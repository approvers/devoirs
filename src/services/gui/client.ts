import * as moment from 'moment';

import { join } from 'path';

import { ApiClient } from '../api/client';
import { ChromiumLauncher } from '../chromium/launcher';
import { Assignment } from '../../models/assignment';
import { Class } from '../../models/class';
import { JSONObject } from 'puppeteer-core';

export class GuiClient {
  constructor(
    private apiClient: ApiClient,
    private chromiumLauncher: ChromiumLauncher,
    private baseDirectory: string
  ) {}

  async start(): Promise<void> {
    const page = await this.chromiumLauncher.launch(
      join(this.baseDirectory, 'assets', 'index.html')
    );

    for (const c of await this.apiClient.getClasses()) {
      const assignments = (await this.apiClient.getAssignments(c.id))
        .sort((a: Assignment, b: Assignment) =>
          a.dueDateTime.localeCompare(b.dueDateTime)
        )
        .map((a) => ({
          ...a,
          dueDateTime: moment(a.dueDateTime).format('ll LTS'),
        }));

      await page.evaluate(
        (c: Class, assignments: Assignment[]) => {
          const $classes = document.getElementById('classes');
          const $class = document.createElement('li');
          const $name = document.createElement('span');
          const $assignments = document.createElement('ul');

          for (const a of assignments) {
            const $assignment = document.createElement('li');

            $assignment.textContent = a.displayName;
            $assignment.setAttribute('data-due-datetime', a.dueDateTime);
            $assignment.setAttribute(
              'data-completed',
              a.isCompleted ? '1' : '0'
            );

            $assignments.appendChild($assignment);
          }

          $name.textContent = c.name;
          $name.addEventListener('click', () => {
            $class.classList.toggle('is-hidden');
          });

          $class.appendChild($name);
          $class.appendChild($assignments);
          $classes.appendChild($class);
        },
        (c as unknown) as JSONObject,
        (assignments as unknown) as JSONObject
      );
    }
  }
}
