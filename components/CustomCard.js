// components/CustomCard.js
import { View } from 'react-native';

export default function CustomCard({ children, className }) {
  return (
    <View
      className={`rounded-2xl bg-white shadow-md p-4 mb-4 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}
