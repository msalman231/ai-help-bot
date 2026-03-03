import Avatar from '@/components/Avatar'
import React from 'react'

function loading() {
    return (
        <div className='mx-auto animate-spin p-10'>
            <Avatar seed='Chat bot Support Agent' />
        </div>
    )
}

export default loading
