import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Documents Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
  },
  text: {
    fontSize: 18,
    color: '#000000', // Black text color
    textAlign: 'center',
  },
});