import React from 'react'
import BackgroundContainer from './BackgroundContainer'
import { Namespace } from '../../utils'

export interface BatchActionsProps {
  
}

const BatchActions: React.FC<BatchActionsProps> = props => {
  const {  } = props
  return (
    <BackgroundContainer
      margin
      padding
      strore_key={Namespace.BATCH_ACTIONS_COLOR}
    >
      BatchActions
    </BackgroundContainer>
  )
}

export default BatchActions
