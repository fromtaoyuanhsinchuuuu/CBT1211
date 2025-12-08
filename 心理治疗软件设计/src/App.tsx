import { useState } from 'react';
import { HomeworkCenter } from './components/HomeworkCenter';
import { Splash } from './components/Splash';
import { PhoneFrame } from './components/PhoneFrame';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <PhoneFrame>
        <Splash onFinish={() => setShowSplash(false)} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <HomeworkCenter />
    </PhoneFrame>
  );
}
