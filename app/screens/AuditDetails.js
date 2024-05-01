import React, {useState, useEffect, useRef} from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  ScrollView,
  Center,
  Spinner,
  Button,
  Select,
  CheckIcon,
  HStack,
  Modal,
  FormControl,
  Input,
  Image,
  useTheme,
  useColorModeValue,
  Pressable,
  TextArea,
  Icon,
} from 'native-base';
import {View, StyleSheet} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Signature from 'react-native-signature-canvas';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api/Api';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';


const AuditDetails = ({route, navigation}) => {
  const theme = useTheme();
  const scrollViewRef = useRef();
  const isFocused = useIsFocused();
  //
  const {AuditId} = route.params;
  const {clientName} = route.params;
  const {user} = route.params;
  //
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState({});
  const [categories, setCategories] = useState([]);
  const [signature, setSignature] = useState(null);
  const [kpiElements, setKpiElements] = useState([]);
  //  
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [currentKPI, setCurrentKPI] = useState({});
  
  const backgroundColor = useColorModeValue(
    'coolGray.50',
    theme.colors.fdis[1100],
  ); // Adjust for light and dark modes
  const cardBackgroundColor = useColorModeValue(
    'gray.100',
    theme.colors.fdis[900],
  );
  const headingTextColor = useColorModeValue('coolGray.800', 'black');
  const textColor = useColorModeValue('coolGray.800', 'black');
  const btnColor = useColorModeValue(theme.colors.fdis[400],theme.colors.fdis[600]);

  useEffect(() => {
    if (isFocused) {
      renderAddPersonButton();
      fetchAuditData();
    }
  }, [isFocused, AuditId, navigation]);

  const fetchAuditData = () => {
    setLoading(true);
    database
      .getAuditById(AuditId)
      .then(audit => {
        setAudit(audit);
        console.log('audit.NameClient: ' + audit.NameClient);
        console.log('audit.LocationSize: ' + audit.LocationSize);

        return audit;
      })
      .then(audit =>
        Promise.all([
          database.getTotalCounterElementByCategory(
            audit.NameClient,
            audit.LocationSize,
          ),
          database.getAuditCounterElements(audit.Id),
        ]),
      )
      .then(([categories, counters]) => {
        const all = categories.map((cat, index) => {
          const counter = counters.find(
            counter => counter.CategoryId === cat.Id,
          ) || {CounterElements: 0};
          return {...cat, CounterElements: counter.CounterElements};
        });
        console.log('all ' + all[0].Min);
        console.log('Categories and Counters: ', JSON.stringify(all)); 
        setCategories(all);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });

    database
      .getAllElements(AuditId)
      .then(elements => 
        {setKpiElements(elements);
        console.log('Get KPI Elements ' + JSON.stringify(elements));
      })
      .catch(error => console.error(error));
  };

  const handleKpiValueChange = (kpi, elements_auditId, newValue) => {
    console.log('newValue : ' + newValue);
    console.log('elements_auditId : ' + elements_auditId);

    database.setKpiElementValue(elements_auditId, newValue);
    const updatedKpis = kpiElements.map(kpi =>
      kpi.elements_auditId === elements_auditId
        ? {...kpi, ElementValue: newValue}
        : kpi,
    );

    setKpiElements(updatedKpis);
    if (newValue === 'O') {
      setCurrentKPI(kpi);
      setRemarkModalVisible(true);
    }
  };

  const openRemarkModal = kpi => {
    setCurrentKPI(kpi);
    setRemarkModalVisible(true);
  };

  const saveRemark = () => {
    console.log('currentKPI element : ' + JSON.stringify(currentKPI, null, 2));

    database.setKpiElementComment(
      currentKPI.elements_auditId,
      currentKPI.ElementComment,
    );    
    const updatedKpis = kpiElements.map(kpi =>
      kpi.elements_auditId === currentKPI.elements_auditId
        ? {...kpi, ElementComment: currentKPI.ElementComment}
        : kpi,
    );
    console.log('updatedKpis : ' + JSON.stringify(updatedKpis, null, 2));

    setKpiElements(updatedKpis);
    setRemarkModalVisible(false);
  };

  const handleSignature = signature => {
    setSignature(signature);
  };

  const handleClearSignature = () => {
    setSignature(null);
  };

  const disableScroll = () =>
    scrollViewRef.current.setNativeProps({scrollEnabled: false});
  const enableScroll = () =>
    scrollViewRef.current.setNativeProps({scrollEnabled: true}); 

  const signatureStyle = `
    .m-signature-pad {
      box-shadow: none; 
      border: none;
      width: 100%;
      height: 100%;
    }
    .m-signature-pad--body {
      border: none; 
      width: 100%; 
      height: 100%;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
      max-width: 100%;
      max-height: 100%;
    }
  `;

  const renderAddPersonButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() =>
            navigation.navigate('Aanwezig bij Audit', {AuditId: AuditId})
          }
          startIcon={
            <Icon
              as={MaterialIcons}
              name="person-add"
              size="xl"
              color="white"
            />
          }
          backgroundColor={btnColor}
          _pressed={{
            bg: theme.colors.fdis[500],
          }}
          _text={{
            color: 'white',
            fontSize: 'md',
          }}
          px="3"
          py="2"
          accessibilityLabel="Add Person"></Button>
      ),
    });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      flex={1}
      bg={backgroundColor}
      _contentContainerStyle={{
        p: '2',
        mb: '4',
        pb: '75', // Adjust this value to the height of your footer
      }}>
      <AuditSection
        audit={audit}
        cardBackgroundColor={cardBackgroundColor}
        headingTextColor={headingTextColor}
        textColor={textColor}
      />
      <VStack
        bg={cardBackgroundColor}
        space={2}
        p="1"
        shadow="1"
        mt={2}
        rounded={'xs'}>
        <Heading fontSize="lg" bold mt="1" color={headingTextColor} p="2">
          Categories (Geteld/Minimum)
        </Heading>
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            cardBackgroundColor={cardBackgroundColor}
          />
        ))}
      </VStack>
      <VStack
        bg={cardBackgroundColor}
        space={2}
        p="1"
        shadow="1"
        mt={2}
        rounded={'xs'}>
        <Heading fontSize="lg" bold mt="1" color={headingTextColor}>
          KPI-metrieken
        </Heading>
        {kpiElements.map((kpi, index) => (
          <KpiRow
            key={index}
            kpi={kpi}
            onChange={handleKpiValueChange}
            cardBackgroundColor={cardBackgroundColor}
            openRemarkModal={() => openRemarkModal(kpi)}
          />
        ))}
      </VStack>
      <RemarkModal
        btnColor={btnColor}
        isOpen={remarkModalVisible}
        onClose={() => setRemarkModalVisible(false)}
        currentKPI={currentKPI}
        setCurrentKPI={setCurrentKPI}
        saveRemark={saveRemark}
      />
      <Button
        mt="2"
        bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
        _text={{color: 'white'}}
        onPress={() =>
          onStartResumeClick({AuditId, navigation, audit, user, clientName})
        }>
        Starten/Hervatten
      </Button>
      <VStack
        space={2}
        bg={cardBackgroundColor}
        p="1"
        shadow="1"
        mt={2}
        rounded={'xs'}>
        <View
          style={{height: 120, marginTop: 5, overflow: 'hidden'}}
          onTouchStart={disableScroll}
          onTouchEnd={enableScroll}>
          <Signature
            onOK={handleSignature}
            onClear={handleClearSignature}
            descriptionText="Sign Below"
            clearText="Clear"
            confirmText="Save Signature"
            webStyle={signatureStyle}
          />
        </View>
        {signature && (
          <Image
            resizeMode="contain"
            source={{uri: signature}}
            style={{width: '100%', height: 100}}
          />
        )}
        <HStack flex={1} space={2}>
          <Button
            flex={1}
            mt="2"
            onPress={handleClearSignature}
            bg={useColorModeValue(
              theme.colors.fdis[400],
              theme.colors.fdis[600],
            )}
            _text={{color: 'white'}}>
            Clear Signature
          </Button>
          <Button
            flex={1}
            mt="2"
            onPress={() => console.log('Uploading signature...')}
            bg={useColorModeValue(
              theme.colors.fdis[400],
              theme.colors.fdis[600],
            )}
            _text={{color: 'white'}}>
            Upload Signature
          </Button>
        </HStack>
        <Button
          mt="2"
          onPress={() => console.log('Uploading signature...')}
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{color: 'white'}}>
          Uploaden
        </Button>
      </VStack>
    </ScrollView>
  );
};

const AuditSection = ({
  audit,
  cardBackgroundColor,
  headingTextColor,
  textColor,
}) => (
  <VStack space={2} bg={cardBackgroundColor} p="2" rounded="xs" shadow="1">
    <Heading size="md" bold color={headingTextColor}>
      Informatie
    </Heading>
    <VStack
      space={0}
      divider={<Box borderBottomWidth="1" borderColor="gray.300" />}>
      {[
        {label: 'Klant', value: audit.NameClient},
        {label: 'Code', value: audit.AuditCode},
        {label: 'Audit soort', value: audit.Type},
        {label: 'Locatie', value: audit.LocationClient},
      ].map((item, index) => (
        <HStack
          key={index}
          justifyContent="space-between"
          alignItems="center"
          bg={index % 2 === 0 ? 'gray.50' : 'white'}>
          <Box flex={1} p="2" borderRightWidth="1" borderColor="gray.200">
            <Text fontWeight="medium" color={textColor}>
              {item.label}
            </Text>
          </Box>
          <Box flex={1} p="2">
            <Text textAlign="left" color={textColor}>
              {item.value}
            </Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  </VStack>
);

const CategoryCard = ({category, cardBackgroundColor, key}) => {
  const isFail = (category.CounterElements || 0) < (category.Min || 0);
  const textColor = useColorModeValue(
    isFail ? 'red.500' : 'green.500', // Bright colors for text in light mode
    isFail ? 'red.500' : 'green.500', // Suitable text colors for dark mode
  );
  const celColor = 'gray.50';
  const borderColor = useColorModeValue('gray.300', 'gray.600'); // Adaptive border color

  return (
    <Box
      borderBottomWidth="1"
      borderColor={borderColor} // Adjust borderColor for dark mode
      bg={cardBackgroundColor}>
      <HStack space={0}>
        <Box
          flex={1}
          borderRightWidth="1"
          borderColor={useColorModeValue('gray.200', 'gray.500')} // Adjust borderColor for dark mode
          p="2"
          bg={celColor}>
          <Text color={textColor} textAlign="left" fontWeight="bold">
            {category.CategoryValue}
          </Text>
        </Box>
        <Box flex={1} p="2" bg={celColor}>
          <Text key={key} color={textColor} textAlign="left" fontWeight="bold">
            {category.CounterElements || 0}/{category.Min}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

const KpiRow = ({kpi, onChange, openRemarkModal, cardBackgroundColor}) => {
  const textColor = useColorModeValue('coolGray.800', 'white'); // Text color
  const borderColor = useColorModeValue('gray.300', 'white'); // Border color
  console.log('kpi : ' + JSON.stringify(kpi, null, 2));
  return (
    <Box
      bg={cardBackgroundColor}
      p="2"
      borderBottomWidth="1"
      borderColor={borderColor}>
      <VStack space={2}>
        <Text fontWeight="bold" color={textColor}>
          {kpi.ElementLabel}
        </Text>
        <HStack space={2} alignItems="center" flex={1}>
          <Select
            borderColor={borderColor}
            selectedValue={kpi.ElementValue}
            flex={1}
            accessibilityLabel="Kies waarde"
            placeholder="Kies waarde"
            _selectedItem={{
              // bg: useColorModeValue('teal.600', 'teal.300'), // Adjust select item background for themes
              endIcon: <CheckIcon size="5" />,
            }}
            onValueChange={value => onChange(kpi, kpi.elements_auditId, value)}
            placeholderTextColor={useColorModeValue('gray.400', 'gray.50')}
            color={textColor}
            dropdownIcon={<CheckIcon size="5" color={textColor} />}>
            <Select.Item label="V" value="V" />
            <Select.Item label="O" value="O" />
            <Select.Item label="N" value="N" />
            <Select.Item label="G" value="G" />
          </Select>
          {kpi.ElementValue === 'O' && (
            <Pressable onPress={openRemarkModal}>
              <Image
                source={require('../assets/images/baseline_note_black_24dp.png')}
                alt="Comment"
                size="xs"
              />
            </Pressable>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

const RemarkModal = ({
  isOpen,
  onClose,
  currentKPI,
  setCurrentKPI,
  saveRemark,
  btnColor,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Modal.Content maxWidth="400px">
      <Modal.CloseButton />
      <Modal.Header>Opmerkingen</Modal.Header>
      <Modal.Body>
        <FormControl>
          <FormControl.Label>
            {currentKPI.ElementLabel}
          </FormControl.Label>
          <TextArea
            placeholder="Type hier uw opmerking..."
            value={currentKPI.ElementComment || ''}
            onChangeText={text =>
              setCurrentKPI({
                ...currentKPI, // Spread the existing KPI data
                ElementComment: text, // Update the comment field with new text
              })
            }
          />
        </FormControl>
      </Modal.Body>
      <Modal.Footer>
        <Button.Group space={2}>
          <Button variant="ghost" onPress={onClose}>
            Annuleren
          </Button>
          <Button onPress={saveRemark} bg={btnColor} _text={{color: 'white'}}>
            Opslaan
          </Button>
        </Button.Group>
      </Modal.Footer>
    </Modal.Content>
  </Modal>
);

// functions
const onStartResumeClick = ({AuditId, navigation, audit, user, clientName}) => {
  console.log(AuditId);
  if (!AuditId) {
    console.log('Audit data is not available yet');
    return;
  }

  database
    .getLastUncompletedForm(AuditId)
    .then(form => {
      console.log(
        'Check if uncompleted form exists: ' + JSON.stringify(form, null, 2),
      );

      if (form) {
        navigation.navigate('Audit Formulier', {form: form});
        console.log('Form bestaat, redirect naar Toon formulier');
      } else {
        navigation.navigate('Uitgevoerde Audit', {
          audit: audit,
          clientName: clientName,
          user: user,
        });
        console.log('rrr');
      }
    })
    .catch(console.error);
};



export default AuditDetails;
