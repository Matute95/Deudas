import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function Deudor({route, navigation}) {
  const [cuadroTexto, setCuadroTexto] = useState(0);
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const { elemento } = route.params;
  const [data, setData] = useState({});
  
  useEffect(() => {
    async function fetchData() {
      try {
        const json = await AsyncStorage.getItem(elemento);
        const data = JSON.parse(json);
        const dif = data.plazo-data.dias
        setData(data);
        setCuadroTexto(Math.floor(data.monto / dif));
      } catch (error) {
        console.error(error);
      }
    }    
    fetchData();
    navigation.setOptions({
      title: elemento,
    });
  }, []);

  const editar = async () => {
    try {
      if(data.monto>0){
        const newData = {
        monto: data.monto,
        plazo: data.plazo,
        dias: data.dias,
        porcentaje: data.porcentaje,
        fecha: data.fecha,
        pagado: cuadroTexto
      };
      await AsyncStorage.setItem(elemento, JSON.stringify(newData));
      }else{
        await AsyncStorage.removeItem(elemento)
      }
      navigation.replace('Inicio');
      console.log('Valor guardado con éxito');
    } catch (error) {
      console.log('Error al guardar el valor:', error);
    }
  }  

  const cobrar = () => {
    if (cuadroTexto > data.monto) {
      Alert.alert('Error', 'El valor ingresado es mayor al monto restante');
    } else {
      data.monto = data.monto - cuadroTexto;
      data.dias = data.dias + 1;
      editar()
    }
  };

  const revertirPago = () => {
    setMostrarDialogo(true);
  };

  const aceptarRevertirPago = () => {
    const nuevo = parseInt(data.monto) + parseInt(data.pagado)
    data.monto = nuevo.toString
    data.dias = data.dias - 1;
    setCuadroTexto(0);
    setMostrarDialogo(false);
    editar()
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fecha del préstamo: {data.fecha}</Text>
      <Text style={styles.text}>Deuda restante: {data.monto} Bs</Text>
      <Text style={styles.text}>Plazo maximo: {data.plazo} Dias</Text>
      <Text style={styles.text}>Días cobrados: {data.dias} Dias</Text>
      <TextInput
        style={styles.input}
        value={cuadroTexto.toString()}
        onChangeText={(texto) => setCuadroTexto(texto)}
        keyboardType='numeric'
      />
      <TouchableOpacity onPress={cobrar} style={styles.button}>
        <Text style={styles.buttonText}>Cobrar</Text>
      </TouchableOpacity>
      {data.pagado > 0 && (
        <TouchableOpacity onPress={revertirPago} style={styles.button2}>
          <Text style={styles.buttonText}>Revertir pago</Text>
        </TouchableOpacity>
      )}
      {mostrarDialogo && (
        <View style={styles.dialogContainer}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogText}>¿Está seguro que desea revertir el pago de {data.pagado}?</Text>
            <TouchableOpacity  onPress={aceptarRevertirPago} style={styles.button}>
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMostrarDialogo(false)} style={styles.button2} >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '50%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  button2: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  dialogContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
  },
  dialogText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});