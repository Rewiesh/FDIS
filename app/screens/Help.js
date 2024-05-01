import React, {useRef} from 'react';
import {View, Button, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const Help = () => {
  const webViewRef = useRef(null);

  const onNavigationStateChange = state => {
    // Handle navigation state changes here if needed
  };

  const onPrev = () => {
    webViewRef.current?.goBack();
  };

  const onNext = () => {
    webViewRef.current?.goForward();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        onNavigationStateChange={onNavigationStateChange}
        source={{
          uri: 'https://backend-quality.iccaadvies.eu/',
        }}
      />
      <View style={styles.navigationContainer}>
        <Button title="Prev" onPress={onPrev} style={styles.button} />
        <Button title="Next" onPress={onNext} style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
  },
  navigationContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    flex: 1,
  },
});

export default Help;

// import React, {useState} from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   Alert,
// } from 'react-native';
// import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

// const Help = () => {
//   const [filePath, setFilePath] = useState('');

//   const chooseFile = () => {
//     Alert.alert(
//       'Add Photo',
//       'Choose from',
//       [
//         {
//           text: 'Gallery',
//           onPress: () => launchImagePicker('gallery'),
//         },
//         {
//           text: 'Camera',
//           onPress: () => launchImagePicker('camera'),
//         },
//         {
//           text: 'Cancel',
//           onPress: () => console.log('Cancel Pressed'),
//           style: 'cancel',
//         },
//       ],
//       {cancelable: true},
//     );
//   };

//   const launchImagePicker = type => {
//     let options = {
//       mediaType: 'photo',
//       saveToPhotos: true,
//     };
//     if (type === 'gallery') {
//       launchImageLibrary(options, response => {
//         handleImageResponse(response);
//       });
//     } else if (type === 'camera') {
//       launchCamera(options, response => {
//         handleImageResponse(response);
//       });
//     }
//   };

//   const handleImageResponse = response => {
//     console.log('Response = ', response);

//     if (response.didCancel) {
//       console.log('User cancelled image picker');
//     } else if (response.error) {
//       console.log('ImagePicker Error: ', response.error);
//     } else if (response.assets && response.assets.length > 0) {
//       const selectedImage = response.assets[0];
//       setFilePath(selectedImage.uri);
//     } else {
//       console.log('No image selected');
//     }
//   };

//   return (
//     <SafeAreaView style={{flex: 1}}>
//       <Text style={styles.titleText}>
//         Example of Image Picker in React Native
//       </Text>
//       <View style={styles.container}>
//         {filePath !== '' && (
//           <Image source={{uri: filePath}} style={styles.imageStyle} />
//         )}
//         <Text style={styles.textStyle}>{filePath}</Text>
//         <TouchableOpacity
//           activeOpacity={0.5}
//           style={styles.buttonStyle}
//           onPress={chooseFile}>
//           <Text style={styles.textStyle}>Add Photo</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Help;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#9999',
//     alignItems: 'center',
//   },
//   titleText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     paddingVertical: 20,
//   },
//   textStyle: {
//     padding: 10,
//     color: 'black',
//   },
//   buttonStyle: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     backgroundColor: '#DDDDDD',
//     padding: 10,
//     borderRadius: 5,
//   },
//   imageStyle: {
//     width: 200,
//     height: 200,
//     marginVertical: 10,
//   },
// });
