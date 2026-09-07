import { REPOSITORY, SUITE_NAME, VERSION } from "../const";

export function printBanner(cardTypes: string[]): void {
  /* eslint-disable no-console */
  console.groupCollapsed(
    `%c ${SUITE_NAME} %c v${VERSION} `,
    "color: white; background: #03a9f4; font-weight: 700; border-radius: 3px 0 0 3px;",
    "color: #03a9f4; background: #2c2c2c; font-weight: 700; border-radius: 0 3px 3px 0;",
  );
  console.info(`Cards: ${cardTypes.join(", ")}`);
  console.info(REPOSITORY);
  console.groupEnd();
  /* eslint-enable no-console */
}
