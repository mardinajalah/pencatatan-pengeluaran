import { View, TouchableWithoutFeedback, Modal } from 'react-native'
import React from 'react'

interface ModalComponetProps {
  isModalVisible: boolean;
  handleIsModalVisible: () => void;
  children: React.ReactNode;
}

const ModalComponet:React.FC<ModalComponetProps> = ({isModalVisible, handleIsModalVisible, children}) => {
  return (
    <Modal
        visible={isModalVisible}
        transparent
        animationType='slide'
        onRequestClose={handleIsModalVisible}
      >
        <TouchableWithoutFeedback onPress={handleIsModalVisible}>
          <View className='flex-1 bg-black/50 justify-center items-center px-6'>
            <TouchableWithoutFeedback>
              {children}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
  )
}

export default ModalComponet