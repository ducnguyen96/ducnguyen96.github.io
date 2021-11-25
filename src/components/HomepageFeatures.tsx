/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import clsx from "clsx";
import styles from "./HomepageFeatures.module.css";

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Tutorial",
    image: "/img/undraw_docusaurus_mountain.svg",
    description: (
      <>
        Là nơi mình lưu lại những đoạn code mẫu mà có thể dùng lại trong tương
        lai.
      </>
    ),
  },
  {
    title: "Blog",
    image: "/img/undraw_docusaurus_tree.svg",
    description: (
      <>
        Mình chia sẻ một số kiến thức - thủ thuật, khái niệm, thuật ngữ,... mà
        mình biết xuyên suốt quá trình học tập và làm việc.
      </>
    ),
  },
  {
    title: "Youtube",
    image: "/img/undraw_docusaurus_react.svg",
    description: (
      <>
        Khi mình thấy hứng thú với thứ gì đó hay 1 công nghệ gì đó, mình muốn áp
        dụng nó vào thực tiễn. Nếu có thời gian mình muốn làm video về những
        side projects đó.
      </>
    ),
  },
];

function Feature({ title, image, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
